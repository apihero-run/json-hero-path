import { PathComponent } from './path/path-component';
import PathBuilder from './path/path-builder';
import QueryResult from './path/query-result';
import StartPathComponent from './path/start-path-component';

class JSONHeroPath {
  readonly components: PathComponent[];

  constructor(components: PathComponent[]) {
    this.components = components;
  }

  static fromString(string: string): JSONHeroPath {
    let pathBuilder = new PathBuilder();
    let components = pathBuilder.parse(string);
    return new JSONHeroPath(components);
  }

  toString(): string {
    return this.components.map((component) => component.toString()).join('.');
  }

  first(object: any): any {
    let results = this.all(object);
    if (results === null || results.length === 0) {
      return null;
    }

    return results[0];
  }

  all(object: any): any[] {
    //if the path is just a wildcard then return the original object
    if (this.components.length == 0) return object;
    if (this.components.length == 1 && this.components[0] instanceof StartPathComponent) return object;

    let results: QueryResult[] = [];
    let firstResult = new QueryResult(0, object);
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
    return results.map((result) => result.flatten());
  }
}

export { JSONHeroPath };
