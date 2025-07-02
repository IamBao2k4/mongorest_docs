function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function addUuid(
  data: any,
  uuid: string = generateUUID(),
  fieldName: string = 'id'
): any {
  console.log(uuid);

  if (!isValidUUID(uuid)) {
    throw new Error("Invalid UUID format");
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => addUuid(item, generateUUID(), fieldName));
    } else {
      return {
        ...data,
        [fieldName]: uuid,
      };
    }
  }
  return data;
}

console.log(addUuid({ name: "Test" })); // { name: "Test", id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" }
console.log(addUuid([{ name: "Test1" }, { name: "Test2" }]));
// [{ name: "Test1", id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" }, { name: "Test2", id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" }]

console.log(addUuid({ name: "Test" }, generateUUID(), "userId")); // { name: "Test", userId: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" }