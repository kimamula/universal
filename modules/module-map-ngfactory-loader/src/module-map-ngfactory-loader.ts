/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Injectable,
  NgModuleFactoryLoader,
  InjectionToken,
  NgModuleFactory,
  Inject,
  Type,
  Compiler,
  Optional
} from '@angular/core';
import {ModuleMap} from './module-map';
import {LinkPreloadHeadersSetter} from '@nguniversal/common';

/**
 * Token used by the ModuleMapNgFactoryLoader to load modules
 */
export const MODULE_MAP: InjectionToken<ModuleMap> = new InjectionToken('MODULE_MAP');

/**
 * NgModuleFactoryLoader which does not lazy load
 */
@Injectable()
export class ModuleMapNgFactoryLoader implements NgModuleFactoryLoader {
  constructor(
    private compiler: Compiler,
    @Inject(MODULE_MAP) private moduleMap: ModuleMap,
    @Optional() private linkPreloadHeadersSetter: LinkPreloadHeadersSetter
  ) { }

  load(loadChildrenString: string): Promise<NgModuleFactory<any>> {
    const offlineMode = this.compiler instanceof Compiler;
    const type = this.moduleMap[loadChildrenString];

    if (!type) {
      throw new Error(`${loadChildrenString} did not exist in the MODULE_MAP`);
    }

    if (this.linkPreloadHeadersSetter) {
      const hashIndex = loadChildrenString.indexOf('#');
      this.linkPreloadHeadersSetter.onLoad(hashIndex < 0
        ? loadChildrenString
        : loadChildrenString.substr(0, hashIndex)
      );
    }

    return offlineMode ?
      this.loadFactory(<NgModuleFactory<any>> type) : this.loadAndCompile(<Type<any>> type);
  }

  private loadFactory(factory: NgModuleFactory<any>): Promise<NgModuleFactory<any>> {
    return new Promise(resolve => resolve(factory));
  }

  private loadAndCompile(type: Type<any>): Promise<NgModuleFactory<any>> {
    return this.compiler.compileModuleAsync(type);
  }
}
