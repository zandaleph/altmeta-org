graph
    InitialUserTriggerProps -->|stackName| addInitialUserPolicyStatement
    InitialUserTriggerProps -->|userPoolId| Func
    FuncPolicy[FuncPolicy<br>ManagedPolicy] --> addInitialUserPolicyStatement
    addInitialUserPolicyStatement[addInitialUserPolicyStatement<br>PolicyStatement]
    FuncRole[FuncRole<br>Role] --> FuncPolicy
    Func[Func<br>NodejsFunction] -->|Role| FuncRole
    Trigger[Trigger<br>Trigger] --> Func
