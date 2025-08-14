declare module "lunr" {
  namespace lunr {
    interface Index {
      search(query: string): Index.Result[];
    }

    namespace Index {
      interface Result {
        ref: string;
        score: number;
      }

      function load(serializedIndex: any): Index;
    }
  }

  function lunr(): lunr.Index;

  export = lunr;
}

declare module "lunr-languages/lunr.stemmer.support.js" {
  function stemmerSupport(lunr: any): void;
  export = stemmerSupport;
}

declare module "lunr-languages/tinyseg.js" {
  function tinyseg(lunr: any): void;
  export = tinyseg;
}

declare module "lunr-languages/lunr.ja.js" {
  function ja(lunr: any): void;
  export = ja;
}

declare module "turndown" {
  class TurndownService {
    constructor(options?: any);
    turndown(html: string): string;
    use(plugins: any): TurndownService;
    addRule(key: string, rule: any): TurndownService;
    remove(filter: string | string[]): TurndownService;
  }
  export = TurndownService;
}
