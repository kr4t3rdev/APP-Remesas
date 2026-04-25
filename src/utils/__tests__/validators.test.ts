import {
  validateEmail,
  validatePassword,
  validateName,
  validateNickname,
  validateForm,
} from "../validators";

describe("Email Validators", () => {
  describe("validateEmail", () => {
    it("should reject invalid email formats", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@.com")).toBe(false);
      expect(validateEmail("user name@example.com")).toBe(false);
    });

    it("should accept valid email formats", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("john.doe@company.co.uk")).toBe(true);
      expect(validateEmail("test+tag@example.com")).toBe(true);
    });

    it("should reject emails longer than 254 characters", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should reject passwords shorter than 8 characters", () => {
      expect(validatePassword("Pass12")).toBe(false);
    });

    it("should reject passwords without uppercase letter", () => {
      expect(validatePassword("password123")).toBe(false);
    });

    it("should reject passwords without lowercase letter", () => {
      expect(validatePassword("PASSWORD123")).toBe(false);
    });

    it("should reject passwords without number", () => {
      expect(validatePassword("Password")).toBe(false);
    });

    it("should reject passwords with leading or trailing spaces", () => {
      expect(validatePassword(" Pass123")).toBe(false);
      expect(validatePassword("Pass123 ")).toBe(false);
      expect(validatePassword(" Pass123 ")).toBe(false);
    });

    it("should accept valid strong passwords", () => {
      expect(validatePassword("ValidPass123")).toBe(true);
      expect(validatePassword("MySecure@Pass1")).toBe(true);
      expect(validatePassword("Test123Abc")).toBe(true);
    });

    it("should accept passwords with special characters", () => {
      expect(validatePassword("P@ssw0rd!")).toBe(true);
      expect(validatePassword("Test#123Abc")).toBe(true);
    });
  });

  describe("validateName", () => {
    it("should reject names shorter than 2 characters", () => {
      expect(validateName("A")).toBe(false);
    });

    it("should reject empty names", () => {
      expect(validateName("")).toBe(false);
    });

    it("should accept valid names", () => {
      expect(validateName("Juan")).toBe(true);
      expect(validateName("María José")).toBe(true);
      expect(validateName("José-María")).toBe(true);
    });

    it("should accept names with at least 2 characters", () => {
      expect(validateName("Ma")).toBe(true);
    });
  });

  describe("validateNickname", () => {
    it("should accept empty nickname (optional field)", () => {
      expect(validateNickname("")).toBe(true);
    });

    it("should reject nicknames shorter than 2 characters", () => {
      expect(validateNickname("a")).toBe(false);
    });

    it("should reject nicknames with invalid characters", () => {
      expect(validateNickname("user@name")).toBe(false);
      expect(validateNickname("user name")).toBe(false);
      expect(validateNickname("user.name")).toBe(false);
      expect(validateNickname("user#name")).toBe(false);
    });

    it("should accept valid alphanumeric nicknames", () => {
      expect(validateNickname("username123")).toBe(true);
      expect(validateNickname("john_doe")).toBe(true);
      expect(validateNickname("user-name")).toBe(true);
      expect(validateNickname("User123")).toBe(true);
    });

    it("should accept nicknames with hyphens and underscores", () => {
      expect(validateNickname("user-name-123")).toBe(true);
      expect(validateNickname("user_name_123")).toBe(true);
      expect(validateNickname("user-name_123")).toBe(true);
    });
  });

  describe("validateForm", () => {
    it("should return all errors for empty form", () => {
      const errors = validateForm({
        name: "",
        nickname: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptedTerms: false,
      });

      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.terms).toBeDefined();
    });

    it("should return error when passwords don't match", () => {
      const errors = validateForm({
        name: "Juan",
        nickname: "",
        email: "juan@example.com",
        password: "ValidPass123",
        confirmPassword: "DifferentPass123",
        acceptedTerms: true,
      });

      expect(errors.confirmPassword).toBe("Las contraseñas no coinciden");
    });

    it("should return no errors for valid form", () => {
      const errors = validateForm({
        name: "Juan Pérez",
        nickname: "juanperez",
        email: "juan@example.com",
        password: "ValidPass123",
        confirmPassword: "ValidPass123",
        acceptedTerms: true,
      });

      expect(Object.keys(errors).length).toBe(0);
    });

    it("should allow optional nickname", () => {
      const errors = validateForm({
        name: "Juan Pérez",
        nickname: "",
        email: "juan@example.com",
        password: "ValidPass123",
        confirmPassword: "ValidPass123",
        acceptedTerms: true,
      });

      expect(errors.nickname).toBeUndefined();
    });

    it("should return error when terms not accepted", () => {
      const errors = validateForm({
        name: "Juan Pérez",
        nickname: "juanperez",
        email: "juan@example.com",
        password: "ValidPass123",
        confirmPassword: "ValidPass123",
        acceptedTerms: false,
      });

      expect(errors.terms).toBe("Debes aceptar los términos y condiciones");
    });

    it("should validate all fields independently", () => {
      const errors = validateForm({
        name: "A",
        nickname: "@",
        email: "invalid",
        password: "weak",
        confirmPassword: "different",
        acceptedTerms: false,
      });

      expect(errors.name).toBeDefined();
      expect(errors.nickname).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
      expect(errors.terms).toBeDefined();
    });
  });
});
