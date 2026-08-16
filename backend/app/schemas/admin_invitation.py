from datetime import datetime

from pydantic import BaseModel, EmailStr


class AdminInvitationCreate(BaseModel):
    email: EmailStr


class AdminInvitationCreateResponse(BaseModel):
    id: int
    email: EmailStr
    status: str
    expires_at: datetime
    created_at: datetime

    # Only ever populated in the response to the creating
    # super_admin, exactly once, right after the invitation is
    # created - never stored anywhere and never returned by any
    # other endpoint (there is currently no "list invitations"
    # endpoint, but if one is added later it must not include this
    # field).
    invitation_link: str

    class Config:
        from_attributes = True


class AdminInvitationAccept(BaseModel):
    token: str
    name: str
    password: str

    # Deliberately no `email` field here. The email an invitation
    # grants admin access for is fixed at creation time and always
    # read from the AdminInvitation row itself - accepting a field
    # here would let the invited person redirect their own admin
    # invitation to an email address of their choosing.
