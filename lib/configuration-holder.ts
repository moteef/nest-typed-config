class ConfigurationHolder {
  private readonly metadata: Map<any, Record<string, string>>;
  private config: Record<string, unknown>;

  constructor() {
    this.metadata = new Map<any, Record<string, string>>();
    this.config = {};
  }

  setConfig(config: Record<string, unknown>) {
    this.config = config;
  }

  register(target: any, key: string, value: string) {
    if (!this.metadata.has(target)) {
      this.metadata.set(target, {});
    }
    (this.metadata.get(target) as Record<string, string>)[key] = value;
  }

  resolve(target: any, key: string): any {
    if (this.metadata.has(target)) {
      const configKey = (this.metadata.get(target) as Record<string, string>)[
        key
      ];
      if (configKey) {
        return this.config[configKey];
      }
    }
    return undefined;
  }
}

export default new ConfigurationHolder();
