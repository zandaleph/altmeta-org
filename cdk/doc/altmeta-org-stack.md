graph
    UserDataBucket[UserDataBucket<br>S3 Bucket]
    Pool[Pool<br>UserPool] -->  Website[Website<br>UserPoolClient]
    Pool --> Domain[Domain<br>UserPoolDomain]
    UserTrigger[UserTrigger<br>InitialUserTrigger] --> Pool
    AltmetaIdentityPool -->|bucketArn| UserDataBucket
    AltmetaIdentityPool -->|userPool| Pool
    AltmetaIdentityPool -->|userPoolClient| Website
