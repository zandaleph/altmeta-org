graph
    UserDataBucket[UserDataBucket<br>S3 Bucket]
    Pool[Pool<br>UserPool]
    Website[Website<br>UserPoolClient]
    subgraph AltmetaRoles
    AuthenticatedUserPolicy[AuthenticatedUserPolicy<br>ManagedPolicy]
    AdminUserPolicy[AdminUserPolicy<br>ManagedPolicy]
    AuthenticatedUserRole --> AuthenticatedUserPolicy
    AdminRole --> AdminUserPolicy
    AdminRole --> AuthenticatedUserPolicy
    end
    AuthenticatedUserRole -.-> IdentityPool
    AdminRole -.-> IdentityPool
    AuthenticatedUserPolicy -->|bucketArn| UserDataBucket
    AdminUserPolicy -->|userPool| Pool
    IdentityPool[IdentityPool<br>CfnIdentityPool]
    IdentityPool -->|userPoolClient| Website
    IdentityPoolRoleMapping[IdentityPoolRoleMapping<br>CfnIdentityPoolRoleAttachment]
    IdentityPoolRoleMapping --> IdentityPool
    IdentityPoolRoleMapping -->|Authenticated Role| AuthenticatedUserRole
    IdentityPoolRoleMapping -->|Admin Role| AdminRole
