import {
  isValidEmail,
  capitalizeFirstLetter,
  formatPhoneNumber,
  isValidPassword,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("isValidEmail", () => {
    test("should return true for valid email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.org")).toBe(true);
    });

    test("should return false for invalid email addresses", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("test.example.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("capitalizeFirstLetter", () => {
    test("should capitalize the first letter of a string", () => {
      expect(capitalizeFirstLetter("hello")).toBe("Hello");
      expect(capitalizeFirstLetter("world")).toBe("World");
      expect(capitalizeFirstLetter("a")).toBe("A");
    });

    test("should handle edge cases", () => {
      expect(capitalizeFirstLetter("")).toBe("");
      expect(capitalizeFirstLetter("HELLO")).toBe("Hello");
      expect(capitalizeFirstLetter("hELLo")).toBe("Hello");
    });
  });

  describe("formatPhoneNumber", () => {
    test("should format 10-digit phone numbers correctly", () => {
      expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
      expect(formatPhoneNumber("5551234567")).toBe("(555) 123-4567");
    });

    test("should handle phone numbers with separators", () => {
      expect(formatPhoneNumber("123-456-7890")).toBe("(123) 456-7890");
      expect(formatPhoneNumber("(123) 456-7890")).toBe("(123) 456-7890");
      expect(formatPhoneNumber("123.456.7890")).toBe("(123) 456-7890");
    });

    test("should return original string if not 10 digits", () => {
      expect(formatPhoneNumber("123456789")).toBe("123456789"); // 9 digits
      expect(formatPhoneNumber("12345678901")).toBe("12345678901"); // 11 digits
      expect(formatPhoneNumber("abc-def-ghij")).toBe("abc-def-ghij");
    });
  });

  describe("isValidPassword", () => {
    test("should return true for valid passwords", () => {
      expect(isValidPassword("ValidPass123")).toBe(true);
      expect(isValidPassword("MyStr0ngP@ss")).toBe(true);
      expect(isValidPassword("Password1")).toBe(true);
    });

    test("should return false for invalid passwords", () => {
      expect(isValidPassword("weakpass")).toBe(false); // No uppercase or number
      expect(isValidPassword("WEAKPASS")).toBe(false); // No lowercase or number
      expect(isValidPassword("Weakpass")).toBe(false); // No number
      expect(isValidPassword("12345678")).toBe(false); // No letters
      expect(isValidPassword("Short1")).toBe(false); // Too short
      expect(isValidPassword("")).toBe(false); // Empty
    });
  });
});
