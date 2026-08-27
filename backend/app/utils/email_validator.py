import re

# Comprehensive list of disposable, temporary, fake, and burner email domains
DISPOSABLE_DOMAINS = {
    # Popular disposable email providers
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.biz",
    "guerrillamail.org",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "10minutemail.com",
    "10minutemail.net",
    "20minutemail.com",
    "throwawaymail.com",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "sharklasers.com",
    "dispostable.com",
    "trashmail.com",
    "trashmail.net",
    "trashmail.org",
    "getairmail.com",
    "fakemailgenerator.com",
    "crazymailing.com",
    "maildrop.cc",
    "mytemp.email",
    "nada.ltd",
    "nada.email",
    "mohmal.com",
    "emailondeck.com",
    "burnermail.io",
    "inboxkitten.com",
    "generator.email",
    "tempail.com",
    "bupmail.com",
    "dropmail.me",
    "fakemail.net",
    "fakemail.com",
    "fake.com",
    "test.com",
    "testing.com",
    "example.com",
    "example.org",
    "example.net",
    "invalid.com",
    "invalid.org",
    "sample.com",
    "temp.com",
    "throwaway.com",
    "asdf.com",
    "qwerty.com",
    "tmail.com",
    "disposablemail.com",
    "fakeinbox.com",
    "tempmailaddress.com",
    "getnada.com",
    "anonaddy.com",
    "simplelogin.com",
    "spam4.me",
    "grr.la",
    "pokemail.net",
    "zillamail.com",
    "sharklasers.net",
    "trashymail.com",
    "emailfake.com",
    "generator.email",
    "incognitomail.org",
    "tempmailgen.com",
}

# Strict RFC email regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

# Common placeholder names that indicate fake entries when coupled with generic patterns
FAKE_USERNAMES = {
    "test",
    "testing",
    "fake",
    "temp",
    "throwaway",
    "asdf",
    "qwerty",
    "noemail",
    "dummy",
    "sample",
    "spam",
    "junk",
}


def validate_email_authenticity(email: str) -> tuple[bool, str]:
    """
    Validates that an email address has a correct format and is not from a
    disposable, temporary, or fake email domain.

    Returns:
        (True, "") if valid.
        (False, error_message) if invalid or disposable.
    """
    if not email or not isinstance(email, str):
        return False, "Email address is required."

    cleaned_email = email.strip().lower()

    # Length checks
    if len(cleaned_email) < 5 or len(cleaned_email) > 254:
        return False, "Email address must be between 5 and 254 characters long."

    # Format regex check
    if not EMAIL_REGEX.match(cleaned_email):
        return False, "Invalid email format. Please enter a valid email (e.g., user@domain.com)."

    # Split into local part and domain
    try:
        local_part, domain = cleaned_email.rsplit("@", 1)
    except ValueError:
        return False, "Invalid email address structure."

    if not local_part or not domain:
        return False, "Email local part and domain are required."

    # Domain structure validation
    domain_parts = domain.split(".")
    if len(domain_parts) < 2:
        return False, "Email domain must include a valid top-level domain (e.g., .com, .org)."

    tld = domain_parts[-1]
    if len(tld) < 2 or not tld.isalpha():
        return False, f"Invalid domain extension (.{tld})."

    # Check for consecutive dots or invalid hyphens
    if ".." in domain or domain.startswith("-") or domain.endswith("-"):
        return False, "Malformed domain name in email address."

    # Check disposable domain blacklist
    if domain in DISPOSABLE_DOMAINS or any(domain.endswith("." + d) for d in DISPOSABLE_DOMAINS):
        return (
            False,
            f"Registration with temporary/disposable email domain '{domain}' is prohibited. Please use a legitimate personal or institutional email.",
        )

    # Check suspicious local parts on 1-word generic domains
    if local_part in FAKE_USERNAMES and domain in {"mail.com", "email.com", "inbox.com", "post.com"}:
        return False, "Generic placeholder email addresses are not permitted."

    return True, ""
