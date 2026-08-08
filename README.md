# Development Structure and Routing Guide

To keep the project organized and avoid conflicts during team development, each module has its own routing, controller, resource page, and component files.

## API Routes

When adding or modifying API routes, use the corresponding route file based on the module.

```text
routes/
├── lgu.php        # LGU API routes
├── farmer.php    # Farmer API routes
└── buyer.php      # Buyer API routes
```

### LGU APIs

For LGU-related API routes, edit:

```text
routes/lgu.php
```

### Farmer APIs

For farmer-related API routes, edit:

```text
routes/farmers.php
```

### Buyer APIs

For buyer-related API routes, edit:

```text
routes/buyer.php
```

Avoid placing module-specific routes in another module's route file.

---

# Controllers

Controllers should also be separated according to their respective modules.

Recommended structure:

```text
app/
└── Http/
    └── Controllers/
        ├── LGU/
        ├── Farmer/
        └── Buyer/
```

Example:

```text
app/Http/Controllers/LGU/
├── DashboardController.php
├── FarmerController.php
└── ReportController.php

app/Http/Controllers/Farmer/
├── DashboardController.php
├── ProductController.php
└── OrderController.php

app/Http/Controllers/Buyer/
├── DashboardController.php
├── ProductController.php
└── OrderController.php
```

When creating a new controller, place it inside the folder of the module that owns the feature.

This separation helps prevent naming conflicts and makes it easier for multiple developers to work on different modules simultaneously.

---

# Resource / Page Structure

Frontend pages should also be separated by module.

Recommended structure:

```text
resources/
└── js/
    └── Pages/
        ├── LGU/
        ├── Farmer/
        └── Buyer/
```

Example:

```text
resources/js/Pages/LGU/
├── Dashboard.tsx
├── Farmers/
└── Reports/

resources/js/Pages/Farmer/
├── Dashboard.tsx
├── Products/
└── Orders/

resources/js/Pages/Buyer/
├── Dashboard.tsx
├── Products/
└── Orders/
```

When working on an LGU page, only modify files under:

```text
resources/js/Pages/LGU/
```

For Farmer pages:

```text
resources/js/Pages/Farmer/
```

For Buyer pages:

```text
resources/js/Pages/Buyer/
```

---

# Components

Components should be separated whenever they are specific to a particular module.

Recommended structure:

```text
resources/
└── js/
    └── Components/
        ├── LGU/
        ├── Farmer/
        ├── Buyer/
        └── Shared/
```

### Module-specific components

```text
Components/LGU/
Components/Farmer/
Components/Buyer/
```

Use these directories for components that are only used by one module.

Example:

```text
Components/LGU/FarmerTable.tsx
Components/Farmer/ProductCard.tsx
Components/Buyer/CartItem.tsx
```

### Shared Components

Reusable components that are used by multiple modules should be placed inside:

```text
Components/Shared/
```

Examples:

```text
Components/Shared/Button.tsx
Components/Shared/Modal.tsx
Components/Shared/DataTable.tsx
Components/Shared/Pagination.tsx
Components/Shared/SearchInput.tsx
```

Do not duplicate the same reusable component across LGU, Farmer, and Buyer folders.

---

# Team Development Guidelines

To minimize Git conflicts during development:

1. Work only within the module assigned to you whenever possible.

2. Keep API routes separated:

   * LGU → `routes/lgu.php`
   * Farmer → `routes/farmers.php`
   * Buyer → `routes/buyer.php`

3. Keep controllers separated by module.

4. Keep frontend pages separated by module.

5. Keep module-specific components inside their corresponding component folders.

6. Place components used by multiple modules inside `Components/Shared`.

7. Avoid modifying another developer's module unless the change has been coordinated with the team.

8. Before creating a new shared component, check if a similar component already exists.

9. Keep commits focused on a specific module or feature.

Example commit messages:

```text
feat(lgu): add farmer monitoring page

feat(farmer): add product registration

feat(buyer): add marketplace product filters

fix(lgu): correct farmer report pagination

refactor(shared): extract reusable data table component
```

---