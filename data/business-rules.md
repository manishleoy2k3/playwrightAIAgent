# Business Rules

## Authentication Rules

### BR-AUTH-001: Account Lockout
- After 5 consecutive failed login attempts, account is locked for 30 minutes
- Lockout applies per IP address and per account
- Admin can manually unlock accounts
- Users receive email notification when account is locked

### BR-AUTH-002: Session Management
- User sessions expire after 2 hours of inactivity
- Maximum session duration is 8 hours regardless of activity
- Single user can have maximum 3 concurrent sessions
- Session tokens are invalidated on password change

### BR-AUTH-003: Password Policy
- Passwords must be changed every 90 days
- Cannot reuse last 5 passwords
- Password reset links expire after 1 hour
- Password hints are not allowed

## Product Management Rules

### BR-PROD-001: Product Code Format
- Product codes must follow format: PROD-XXXXX (where X is alphanumeric)
- Codes must be unique across all products
- Codes are case-insensitive for uniqueness but stored as uppercase
- Codes cannot be changed once product is created

### BR-PROD-002: Pricing Rules
- Product prices cannot be negative
- Discount percentage cannot exceed 90%
- Tax calculation based on product category and customer location
- Price changes require approval for products over $1000

## Order Processing Rules

### BR-ORD-001: Order Validation
- Orders cannot be placed for out-of-stock items
- Minimum order value is $10
- Maximum order quantity per item is 100
- Orders can be cancelled within 24 hours of placement

### BR-ORD-002: Shipping Rules
- Free shipping for orders over $50
- Express shipping available for additional $10
- International shipping calculated based on weight and destination
- Delivery time estimates: 2-3 days domestic, 7-10 days international