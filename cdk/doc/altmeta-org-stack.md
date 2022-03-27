graph
    UserDataBucket[UserDataBucket<br>S3 Bucket]
    Pool --> Domain[Domain<br>UserPoolDomain]
    Pool[Pool<br>UserPool] -->  Website[Website<br>UserPoolClient]
    AuthenticatedUserPolicy[AuthenticatedUserPolicy<br>ManagedPolicy]
    userDataListStatement[userDataListStatement<br>PolicyStatement] --> |resource| UserDataBucket
    AuthenticatedUserPolicy --> userDataListStatement
    userDataAccessStatement[userDataAccessStatement<br>PolicyStatement] --> |resource| UserDataBucket
    AuthenticatedUserPolicy --> userDataAccessStatement
    IdentityPool[IdentityPool<br>IdentityPool]
    IdentityPool --> UserPoolAuthenticationProvider
    UserPoolAuthenticationProvider --> Pool
    UserPoolAuthenticationProvider -->|Client| Website
    IdentityPool --> |Authenticated Role| AuthenticatedUserPolicy
    UserTrigger[UserTrigger<br>InitialUserTrigger] --> Pool
  