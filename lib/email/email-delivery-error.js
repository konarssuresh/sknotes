export class EmailDeliveryError extends Error {
  /**
   * @param {string} category
   * @param {string} safeMessage
   * @param {unknown} [cause]
   */
  constructor(category, safeMessage, cause) {
    super(safeMessage);
    this.name = "EmailDeliveryError";
    this.category = category;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}
