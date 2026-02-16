export interface SerializerFor<T> {
  serialize(value: T): string;
  deserialize(text: string): T;
}

export const StringSerializer: SerializerFor<string> = {
  serialize(value: string): string {
    return value;
  },

  deserialize(text: string): string {
    return text;
  },
};

export const BooleanSerializer: SerializerFor<boolean> = {
  serialize(value: boolean): string {
    return value ? "true" : "false";
  },

  deserialize(text: string): boolean {
    switch (text.toLowerCase()) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new Error(`Invalid boolean value: ${text}`);
    }
  },
};

export const NumberSerializer: SerializerFor<number> = {
  serialize(value: number): string {
    return value.toString();
  },

  deserialize(text: string): number {
    const parsed = Number(text);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number value: ${text}`);
    }
    return parsed;
  },
};

export class NullableSerializer<T> implements SerializerFor<Nullable<T>> {
  private innerSerializer: SerializerFor<T>;

  constructor(innerSerializer: SerializerFor<T>) {
    this.innerSerializer = innerSerializer;
  }

  serialize(value: Nullable<T>): string {
    if (value === null) {
      return "";
    }
    return this.innerSerializer.serialize(value);
  }

  deserialize(text: string): Nullable<T> {
    if (text === "") {
      return null;
    }
    return this.innerSerializer.deserialize(text);
  }
}

export class EnumSerializer<T extends StringEnumType> implements SerializerFor<
  ValueOf<T>
> {
  private enumType: T;

  constructor(enumType: T) {
    this.enumType = enumType;
  }

  serialize(value: ValueOf<T>): string {
    return value;
  }

  deserialize(text: string): ValueOf<T> {
    if (Object.values(this.enumType).includes(text)) {
      return text as ValueOf<T>;
    }
    throw new Error(`Invalid enum value ${text}`);
  }
}
