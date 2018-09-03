// tslint:disable
export interface PushConfig {
// tslint:enable
  [loadPath: string]: { [resource: string]: string };
}

export class LinkPreloadHeadersSetter {
  private headers: string[] = [];
  private loadedPath: string[] = [];
  constructor(private pushConfig: PushConfig, private hasPushCapability: boolean) {
    this.onLoad('');
  }

  onLoad(loadPath: string): void {
    if (this.loadedPath.indexOf(loadPath) >= 0) {
      return;
    }
    this.loadedPath.push(loadPath);
    const resources = this.pushConfig[loadPath] || {};
    for (const resource of Object.keys(resources)) {
      this.headers.push(`</${resource}>; rel=preload; as=${resources[resource]}${
        this.hasPushCapability ? '' : '; nopush'
      }`);
    }
  }

  getHeaders(): string[] {
    return this.headers;
  }
}
