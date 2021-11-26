import { PathComponent } from './path/path-component';
import PathBuilder from './path/path-builder';
import QueryResult from './path/query-result';
import StartPathComponent from './path/start-path-component';

class JSONHeroPath {
  readonly components: PathComponent[];

  constructor(components: PathComponent[] | string) {
    if (typeof components == 'string') {
      let pathBuilder = new PathBuilder();
      this.components = pathBuilder.parse(components);
      return;
    }

    this.components = components;
  }

  root(): JSONHeroPath {
    return new JSONHeroPath(this.components.slice(0, 1));
  }

  parent(): JSONHeroPath | null {
    if (this.components.length == 1) {
      return null;
    }

    return new JSONHeroPath(this.components.slice(0, -1));
  }

  child(key: string) {
    let string = this.toString();
    return new JSONHeroPath(string.concat(`.${key}`));
  }

  toString(): string {
    return this.components.map((component) => component.toString()).join('.');
  }

  first(object: any, options: PathOptions = { includePath: false }): any {
    let results = this.all(object, options);
    if (results === null || results.length === 0) {
      return null;
    }

    return results[0];
  }

  all(object: any, options: PathOptions = { includePath: false }): any[] {
    //if the path is just a wildcard then return the original object
    if (this.components.length == 0) return object;
    if (this.components.length == 1 && this.components[0] instanceof StartPathComponent) return object;

    let results: QueryResult[] = [];
    let firstResult = new QueryResult(0, this.root(), object);
    results.push(firstResult);

    //use the path to traverse the object
    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i];
      results = component.query(results);

      if (results === null || results.length === 0) {
        return [];
      }
    }

    //flatten the result
    let flattenedResults = results.map((result) => result.flatten());

    if (!options.includePath) {
      return flattenedResults.map((result) => result.object);
    }

    let all: any[] = [];
    for (let i = 0; i < flattenedResults.length; i++) {
      let flattenedResult = flattenedResults[i];
      let object: any = {
        value: flattenedResult.object,
      };

      if (options.includePath) {
        object.path = flattenedResult.path;
      }

      all.push(object);
    }

    return all;
  }
}

interface PathOptions {
  includePath: boolean;
}

export { JSONHeroPath };
