---
name: backend-architecture
description: Implement backend code following Domain-Driven Design and Hexagonal Architecture (ports and adapters), split into bounded contexts with domain, application, infrastructure and public layers. Use when writing, refactoring or reviewing backend code.
---

# Backend architecture: DDD and Hexagonal

Based on OADR-0009 (`veecle-platform/docs/oadrs/0009-backend-architecture-convention.md`).
If the project has its own copy, read it first; it wins over this skill.
Follow the existing code's conventions where they do not contradict these rules.

## Structure

Organize code by bounded context.
Each context (e.g. `src/user/`) has:

```text
user/
├── domain/            # Entities, value objects, business rules
│   └── service/       # Domain services
├── application/       # Ports (traits), errors, use cases
│   └── use_case/      # One file per use case
├── infrastructure/    # Adapters implementing the ports
└── public/            # Optional entrypoint for other contexts
```

## Dependency rules

| Layer | May depend on | Must not depend on |
| :--- | :--- | :--- |
| Domain | Nothing | Application, infrastructure |
| Application | Domain | Infrastructure |
| Infrastructure | Domain, application | |
| Public | Domain, application | |

Before writing an import, check it against this table.

## Domain

- Entities can only be built through constructors that enforce every invariant.
    An invalid entity must be impossible to create.
- No primitive obsession: every attribute has its own type.
    Wrap single values in a newtype, validated with `TryFrom` and a `thiserror` error enum.
- Logic spanning several entities, or not fitting one, goes in a domain service under `domain/service/`.
- No I/O, frameworks or serialization concerns.

## Application

- Ports are traits (e.g. `UserRepository`), with their own error enums, defined in `application/`.
- Each use case file in `application/use_case/` contains:
    1. An error enum with every failure mode of that action.
    2. An input struct of serializable, transport-friendly types: `*Command` if it changes state, `*Query` if read-only.
    3. A single response struct of serializable, transport-friendly types, using a field for lists.
    4. A `*Service` struct, generic over its ports, with exactly one public method: `execute(&self, input) -> Result<Response, Error>`.
- A use case is transactional: it succeeds or fails entirely, never partially.
- The use case maps primitives into domain types, runs domain logic and maps the result back into the response.

## Infrastructure

- Implements the ports: databases, HTTP clients, cloud SDKs, brokers (`sqlx`, `reqwest`, ...).
- Entry points (e.g. Axum routes) live here and convert requests into commands or queries.
- No business logic.

## Across bounded contexts

Never import another context's `domain` or `application` from your `domain` or `application`.
If you are about to `use crate::other_context::` there, stop.

In order of preference:

1. **Domain events**: the use case emits events (e.g. `UserCreated`) through a port.
    The reacting context subscribes in its infrastructure and calls its own use case.
    With transactional storage, prefer the Outbox pattern.
2. **Infrastructure to infrastructure**: only for synchronous, latency-sensitive interactions.
    No domain or application types cross the boundary.
3. **`public` layer**: the target context exposes services giving access to its use cases or domain services.

## Composition root

Wire concrete adapters into use case services in `main.rs`.
The application only knows the traits, never the concrete adapters.

## Testing

- Domain: pure unit tests for value objects, entities and domain services.
- Application: integration tests for use cases with real implementations.
- Infrastructure: integration tests against the real system or an embedded equivalent (in-memory store, test database, embedded server).

Mocks are a last resort.
Use a concrete implementation as a test double when it is isolated per test and deterministic.
Mock only a dependency that cannot be substituted without expensive external infrastructure, and only that dependency.

## Adding a feature

1. Value objects and entities in `domain/`.
2. A domain service, if logic spans several entities.
3. Port traits in `application/`.
4. The use case in `application/use_case/`.
5. Adapters in `infrastructure/`.
6. Wiring in `main.rs`.
7. Tests for every layer.
