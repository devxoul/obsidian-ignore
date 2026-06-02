import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

export interface Settings {
	enabled: boolean;
	ignoreFileName: string;
}

export const DEFAULT_SETTINGS: Settings = {
	enabled: true,
	ignoreFileName: ".obsidianignore",
};

export interface ObsidianIgnorePluginLike {
	settings: Settings;
	saveSettings(): Promise<void>;
}

export class IgnoreSettingTab extends PluginSettingTab {
	plugin: ObsidianIgnorePluginLike;

	constructor(app: App, plugin: Plugin & ObsidianIgnorePluginLike) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Enable")
			.setDesc("Hide files matching the ignore file.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Ignore file name")
			.setDesc("Name of the ignore file in the vault root.")
			.addText((text) =>
				text
					.setPlaceholder(".obsidianignore")
					.setValue(this.plugin.settings.ignoreFileName)
					.onChange(async (value) => {
						this.plugin.settings.ignoreFileName = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
