import { error } from "console";
import { QueryParams } from "../index";
import { RbacValidator } from "../rbac/rbac-validator";
import { RelationshipRegistry } from "../relationship/RelationshipRegistry";
import { ElasticSearchRest } from "./elasticsearchrest";
import { MongoRest } from "./mongorest";

export class Core {
  protected rbacValidator: RbacValidator;
  private mongoRest?: MongoRest;
  private elasticseach?: ElasticSearchRest;
  private registry?: RelationshipRegistry;
  constructor(registry?: RelationshipRegistry) {
    this.rbacValidator = new RbacValidator();
    this.rbacValidator.loadConfig();
    this.registry = registry;
  }

  public validate() {
    
  }

  public convert(
    params: QueryParams,
    collection: string,
    roles: string[],
    type: string = "mongorest"
  ): any {
    if (!this.rbacValidator.hasAccess(collection, "read", roles)) {
      throw new Error(
        `User does not have access to read on collection ${collection}`
      );
    }
    switch (type) {
      case "mongorest":
        if (!this.mongoRest) {
          this.mongoRest = new MongoRest(this.registry);
        }
        return this.mongoRest.convert(params, collection, roles);
      case "elasticsearch":
        if (!this.elasticseach) {
          // initial
        }
        // convert
        break;
      default:
        throw error("please input type flowing document");
        break;
    }
  }
}
