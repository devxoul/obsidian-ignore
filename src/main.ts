import { Plugin, TFile } from "obsidian";

import { compactToFolders, computeIgnored } from "./ignore-engine";
import { refreshViews } from "./refreshers";
import {
	DEFAULT_SETTINGS,
	IgnoreSettingTab,
	type ObsidianIgnorePluginLike,
	type Settings,
} from "./settings";
import { diffChanged, mergeEntries, recoverManual, stripOnUnload } from "./vault-config";

const USER_IGNORE_FILTERS = "userIgnoreFilters";

interface PersistedData {
	settings: Settings;
	lastWrittenPluginEntries: string[];
	lastKnownManualEntries: string[];
}

export default class ObsidianIgnorePlugin extends Plugin implements ObsidianIgnorePluginLike {
	settings: Settings = { ...DEFAULT_SETTINGS };
	lastWrittenPluginEntries: string[] = [];
	lastKnownManualEntries: string[] = [];
	private recomputeTimer: number | undefined;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new IgnoreSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.scheduleRecompute();

			this.registerEvent(
				this.app.vault.on("modify", (file) => {
					if (file.path === this.settings.ignoreFileName) {
						this.scheduleRecompute();
					}
				}),
			);

			this.registerEvent(
				this.app.vault.on("create", () => {
					this.scheduleRecompute();
				}),
			);

			this.registerEvent(
				this.app.vault.on("delete", () => {
					this.scheduleRecompute();
				}),
			);

			this.registerEvent(
				this.app.vault.on("rename", () => {
					this.scheduleRecompute();
				}),
			);
		});
	}

	onunload(): void {
		if (this.recomputeTimer !== undefined) {
			window.clearTimeout(this.recomputeTimer);
			this.recomputeTimer = undefined;
		}

		try {
			const current = this.readCurrentIgnoreFilters();
			const manual = stripOnUnload(current, this.lastWrittenPluginEntries);
			this.app.vault.setConfig(USER_IGNORE_FILTERS, manual);
			this.lastWrittenPluginEntries = [];
			this.lastKnownManualEntries = manual;
			void this.persist();
		} catch (error) {
			console.error("Failed to restore Obsidian ignore filters on unload", error);
		}
	}

	async recompute(): Promise<void> {
		try {
			const patternText = this.settings.enabled ? await this.readIgnoreFile() : "";
			const allPaths = this.app.vault.getFiles().map((file) => file.path);
			const ignored = this.settings.enabled ? computeIgnored(patternText, allPaths) : [];
			const computed = this.settings.enabled ? compactToFolders(ignored, allPaths) : [];
			const current = this.readCurrentIgnoreFilters();
			const manual = recoverManual(current, this.lastWrittenPluginEntries);
			const merged = mergeEntries(manual, computed);

			if (
				!diffChanged(this.lastWrittenPluginEntries, computed) &&
				!diffChanged(this.lastKnownManualEntries, manual) &&
				arraysEqual(current, merged)
			) {
				return;
			}

			this.app.vault.setConfig(USER_IGNORE_FILTERS, merged);
			this.lastWrittenPluginEntries = computed;
			this.lastKnownManualEntries = manual;
			await this.persist();
			refreshViews(this.app);
		} catch (error) {
			console.error("Failed to recompute Obsidian ignore filters", error);
		}
	}

	scheduleRecompute(): void {
		if (this.recomputeTimer !== undefined) {
			window.clearTimeout(this.recomputeTimer);
		}

		this.recomputeTimer = window.setTimeout(() => {
			this.recomputeTimer = undefined;
			void this.recompute();
		}, 400);
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<PersistedData> | null;

		this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
		this.lastWrittenPluginEntries = data?.lastWrittenPluginEntries ?? [];
		this.lastKnownManualEntries = data?.lastKnownManualEntries ?? [];
	}

	async saveSettings(): Promise<void> {
		await this.persist();
		this.scheduleRecompute();
	}

	private async persist(): Promise<void> {
		await this.saveData({
			settings: this.settings,
			lastWrittenPluginEntries: this.lastWrittenPluginEntries,
			lastKnownManualEntries: this.lastKnownManualEntries,
		});
	}

	private async readIgnoreFile(): Promise<string> {
		const file = this.app.vault.getAbstractFileByPath(this.settings.ignoreFileName);

		if (file instanceof TFile) {
			return this.app.vault.cachedRead(file);
		}

		return "";
	}

	private readCurrentIgnoreFilters(): string[] {
		try {
			const currentRaw = this.app.vault.getConfig(USER_IGNORE_FILTERS);

			if (Array.isArray(currentRaw)) {
				return currentRaw.filter((entry): entry is string => typeof entry === "string");
			}
		} catch (error) {
			console.error("Failed to read Obsidian ignore filters", error);
		}

		return [];
	}
}

function arraysEqual(first: string[], second: string[]): boolean {
	if (first.length !== second.length) {
		return false;
	}

	return first.every((entry, index) => entry === second[index]);
}
