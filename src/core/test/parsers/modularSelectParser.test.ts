// tests/parsers/modularSelectParser.test.ts - CLEANED VERSION
import { ModularSelectParser } from "../../parsers/selectParser";
import { RelationshipRegistry } from "../../relationship/RelationshipRegistry";

// ✅ Suppress console warnings for cleaner output
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = originalWarn;
});

describe("ModularSelectParser", () => {
  let parser: ModularSelectParser;
  let registry: RelationshipRegistry;

  beforeEach(() => {
    registry = new RelationshipRegistry();

    // Setup test relationships
    registry.registerFromDefinition("users", {
      name: "profile",
      targetTable: "user_profiles",
      localField: "_id",
      foreignField: "user_id",
      type: "one-to-one",
    });

    registry.registerFromDefinition("users", {
      name: "posts",
      targetTable: "posts",
      localField: "_id",
      foreignField: "author_id",
      type: "one-to-many",
    });

    parser = new ModularSelectParser(registry);
  });

  describe("parseSelect", () => {
    it("should parse simple field list", () => {
      const result = parser.parseSelect("users", "id,name,email");

      expect(result.fields).toEqual({
        id: 1,
        name: 1,
        email: 1,
      });
      expect(result.pipeline).toHaveLength(0);
      expect(result.embeds).toHaveLength(0);
    });

    it("should handle wildcard selection", () => {
      const result = parser.parseSelect("users", "*");

      expect(result.fields).toEqual({});
      expect(result.pipeline).toHaveLength(0);
      expect(result.embeds).toHaveLength(0);
    });

    it("should parse simple embed", () => {
      const result = parser.parseSelect("users", "id,name,profile(avatar,bio)");

      expect(result.fields).toEqual({
        id: 1,
        name: 1,
      });
      expect(result.pipeline.length).toBeGreaterThan(0);
      expect(result.embeds).toContain("profile");
    });

    it("should parse multiple embeds", () => {
      const result = parser.parseSelect(
        "users",
        "id,name,profile(avatar),posts(title)"
      );

      expect(result.embeds).toHaveLength(2);
      expect(result.embeds).toContain("profile");
      expect(result.embeds).toContain("posts");
    });

    it("should handle aliases in fields", () => {
      const result = parser.parseSelect(
        "users",
        "fullName:full_name,userEmail:email"
      );

      expect(result.fields).toEqual({
        full_name: 1,
        email: 1,
      });
    });

    it("should handle JSON paths", () => {
      const result = parser.parseSelect(
        "users",
        "id,profile->name,settings->>theme"
      );

      expect(result.fields).toEqual({
        id: 1,
        profile: 1,
        settings: 1,
      });
    });

    // ✅ Clean version - type casting works!
    it("should handle type casting", () => {
      const result = parser.parseSelect(
        "users",
        "id,price::text,active::boolean"
      );

      expect(result.fields).toEqual({
        id: 1,
        price: 1,   // ✅ Correctly extracts "price" from "price::text"
        active: 1,  // ✅ Correctly extracts "active" from "active::boolean"
      });
    });

    it("should handle simple type casting", () => {
      const result = parser.parseSelect("users", "id,name::text");

      expect(result.fields).toEqual({
        id: 1,
        name: 1, // Should extract "name" from "name::text"
      });
    });

    it("should respect max embed depth", () => {
      const shallowParser = new ModularSelectParser(registry, 1);

      // This would normally create nested embeds, but should be limited
      const result = shallowParser.parseSelect(
        "users",
        "id,posts(id,comments(content))"
      );

      expect(result.embeds).toHaveLength(1);
      expect(result.embeds).toContain("posts");
    });

    it("should handle empty select clause", () => {
      const result = parser.parseSelect("users", "");

      expect(result.fields).toEqual({});
      expect(result.pipeline).toHaveLength(0);
      expect(result.embeds).toHaveLength(0);
    });

    it("should handle spaces in field lists", () => {
      const result = parser.parseSelect("users", " id , name , email ");

      expect(result.fields).toEqual({
        id: 1,
        name: 1,
        email: 1,
      });
    });
  });

  describe("tokenizeSelect", () => {
    it("should handle basic field separation", () => {
      const result = parser.parseSelect("users", "id,email,name");

      expect(result.fields).toEqual({
        id: 1,
        email: 1,
        name: 1,
      });
    });

    it("should handle fields with special characters", () => {
      const result = parser.parseSelect("users", "id,field_name,field-name");

      expect(result.fields).toEqual({
        id: 1,
        field_name: 1,
        "field-name": 1,
      });
    });

    it("should handle nested parentheses in embeds", () => {
      // Test complex nesting
      const result = parser.parseSelect("users", "id,posts(title,comments(content))");

      expect(result.fields).toEqual({ id: 1 });
      expect(result.embeds).toContain("posts");
    });
  });

  describe("error handling", () => {
    it("should handle non-existent relationships gracefully", () => {
      const result = parser.parseSelect("users", "id,nonexistent(field)");

      expect(result.fields).toEqual({ id: 1 });
      expect(result.embeds).toHaveLength(0);
    });

    it("should handle malformed embed expressions", () => {
      const result = parser.parseSelect("users", "id,broken(unclosed");

      // Malformed expressions should be treated as regular fields
      expect(result.fields).toEqual({
        id: 1,
        "broken(unclosed": 1,
      });
      expect(result.embeds).toHaveLength(0);
    });

    it("should handle valid embeds correctly", () => {
      const result = parser.parseSelect("users", "id,profile(avatar,bio)");

      expect(result.fields).toEqual({ id: 1 });
      expect(result.embeds).toContain("profile");
    });

    it("should handle empty embed expressions", () => {
      const result = parser.parseSelect("users", "id,profile()");

      expect(result.fields).toEqual({ id: 1 });
      expect(result.embeds).toContain("profile");
    });

    it("should handle multiple consecutive commas", () => {
      const result = parser.parseSelect("users", "id,,name,,,email");

      expect(result.fields).toEqual({
        id: 1,
        name: 1,
        email: 1,
      });
    });
  });

  describe("complex scenarios", () => {
    it("should handle mixed fields, aliases, and embeds", () => {
      const result = parser.parseSelect(
        "users",
        "id,fullName:full_name,profile(avatar,bio),posts(title,status)"
      );

      expect(result.fields).toEqual({
        id: 1,
        full_name: 1,
      });
      expect(result.embeds).toEqual(["profile", "posts"]);
    });

    it("should handle JSON paths with embeds", () => {
      const result = parser.parseSelect(
        "users",
        "id,meta->created_at,profile(avatar),settings->>theme"
      );

      expect(result.fields).toEqual({
        id: 1,
        meta: 1,
        settings: 1,
      });
      expect(result.embeds).toContain("profile");
    });

    it("should handle type casting with embeds", () => {
      const result = parser.parseSelect(
        "users",
        "id,created_at::text,profile(avatar),age::integer"
      );

      expect(result.fields).toEqual({
        id: 1,
        created_at: 1,
        age: 1,
      });
      expect(result.embeds).toContain("profile");
    });

    it("should handle malformed type casting", () => {
      const result = parser.parseSelect("users", "id,::text,field::,normal");

      expect(result.fields).toEqual({
        id: 1,
        normal: 1,
        field: 1
        // ::text and field:: should be ignored
      });
    });
  });
});