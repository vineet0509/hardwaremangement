const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldStr, newStr] of replacements) {
        content = content.replace(oldStr, newStr);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

// 1. SuperAdmin.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'pages', 'SuperAdmin.jsx'), [
    [
        `if(confirm("Are you sure you want to approve this subscription? This will extend the business's plan.")) {\n      api.post(\`/super-admin/subscription-requests/\${id}/approve\`)\n        .then(res => {\n          Swal.fire(res.data.message);\n          fetchSubscriptionRequests();\n          fetchBusinesses();\n        })\n        .catch(err => Swal.fire(err.response?.data?.message || 'Error approving request'));\n    }`,
        `Swal.fire({\n      title: 'Approve Request?',\n      text: "Are you sure you want to approve this subscription? This will extend the business's plan.",\n      icon: 'question',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, approve'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.post(\`/super-admin/subscription-requests/\${id}/approve\`)\n          .then(res => {\n            Swal.fire(res.data.message);\n            fetchSubscriptionRequests();\n            fetchBusinesses();\n          })\n          .catch(err => Swal.fire(err.response?.data?.message || 'Error approving request'));\n      }\n    });`
    ],
    [
        `if(confirm("Reject this request?")) {\n      api.post(\`/super-admin/subscription-requests/\${id}/reject\`)\n        .then(res => {\n          Swal.fire(res.data.message);\n          fetchSubscriptionRequests();\n        })\n        .catch(err => Swal.fire(err.response?.data?.message || 'Error rejecting request'));\n    }`,
        `Swal.fire({\n      title: 'Reject Request?',\n      text: "Reject this request?",\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, reject'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.post(\`/super-admin/subscription-requests/\${id}/reject\`)\n          .then(res => {\n            Swal.fire(res.data.message);\n            fetchSubscriptionRequests();\n          })\n          .catch(err => Swal.fire(err.response?.data?.message || 'Error rejecting request'));\n      }\n    });`
    ]
]);

// 2. Products.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'pages', 'Products.jsx'), [
    [
        `if(confirm("Are you sure you want to delete this product? It will be soft-deleted.")) {\n      api.delete(\`/products/\${id}\`).then(() => fetchProducts());\n    }`,
        `Swal.fire({\n      title: 'Are you sure?',\n      text: "Are you sure you want to delete this product? It will be soft-deleted.",\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, delete it!'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.delete(\`/products/\${id}\`).then(() => fetchProducts());\n      }\n    });`
    ]
]);

// 3. ChildBusinesses.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'pages', 'ChildBusinesses.jsx'), [
    [
        `if (!confirm(\`Are you sure you want to \${currentStatus ? 'disable' : 'enable'} this shop?\`)) return;\n\n    api.put(\`/child-businesses/\${id}\`, { is_active: !currentStatus })\n      .then(() => fetchShops())\n      .catch(err => Swal.fire(err.response?.data?.message || 'Failed to update shop status.'));`,
        `Swal.fire({\n      title: 'Are you sure?',\n      text: \`Are you sure you want to \${currentStatus ? 'disable' : 'enable'} this shop?\`,\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, do it!'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.put(\`/child-businesses/\${id}\`, { is_active: !currentStatus })\n          .then(() => fetchShops())\n          .catch(err => Swal.fire(err.response?.data?.message || 'Failed to update shop status.'));\n      }\n    });`
    ]
]);

// 4. BillsList.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'pages', 'BillsList.jsx'), [
    [
        `if(confirm('Are you sure you want to delete this bill? Stock will be restored.')) {\n      api.delete(\`/bills/\${id}\`).then(() => fetchBills()).catch(console.error);\n    }`,
        `Swal.fire({\n      title: 'Are you sure?',\n      text: 'Are you sure you want to delete this bill? Stock will be restored.',\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, delete it!'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.delete(\`/bills/\${id}\`).then(() => fetchBills()).catch(console.error);\n      }\n    });`
    ]
]);

// 5. Advances.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'pages', 'Advances.jsx'), [
    [
        `if(confirm('Are you sure you want to delete this staff advance?')) {\n      api.delete(\`/staff/\${staffId}/advance-payments/\${advanceId}\`)\n        .then(() => fetchAdvances())\n        .catch(err => Swal.fire(err.response?.data?.message || 'Error deleting advance.'));\n    }`,
        `Swal.fire({\n      title: 'Are you sure?',\n      text: 'Are you sure you want to delete this staff advance?',\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, delete it!'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.delete(\`/staff/\${staffId}/advance-payments/\${advanceId}\`)\n          .then(() => fetchAdvances())\n          .catch(err => Swal.fire(err.response?.data?.message || 'Error deleting advance.'));\n      }\n    });`
    ],
    [
        `if(confirm('Mark this advance as deducted from their salary?')) {\n      api.put(\`/staff/\${staffId}/advance-payments/\${advanceId}\`, { is_deducted: true })\n        .then(() => fetchAdvances())\n        .catch(err => Swal.fire(err.response?.data?.message || 'Error updating advance.'));\n    }`,
        `Swal.fire({\n      title: 'Mark Deducted?',\n      text: 'Mark this advance as deducted from their salary?',\n      icon: 'question',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, mark as deducted'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.put(\`/staff/\${staffId}/advance-payments/\${advanceId}\`, { is_deducted: true })\n          .then(() => fetchAdvances())\n          .catch(err => Swal.fire(err.response?.data?.message || 'Error updating advance.'));\n      }\n    });`
    ]
]);

// 6. Layout.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'components', 'Layout.jsx'), [
    [
        `if(confirm("Are you sure you want to log out?")) {\n       api.post('/logout').catch(console.error).finally(() => {\n          localStorage.removeItem('auth_token');\n          localStorage.removeItem('login_date');\n          window.location.href = '/';\n       });\n    }`,
        `Swal.fire({\n      title: 'Logout',\n      text: "Are you sure you want to log out?",\n      icon: 'question',\n      showCancelButton: true,\n      confirmButtonText: 'Yes, logout'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.post('/logout').catch(console.error).finally(() => {\n          localStorage.removeItem('auth_token');\n          localStorage.removeItem('login_date');\n          window.location.href = '/';\n        });\n      }\n    });`
    ],
    [
        `if (confirm('Are you sure you want to log out?')) {\n                            api.post('/logout').catch(console.error).finally(() => {\n                              localStorage.removeItem('auth_token');\n                              localStorage.removeItem('login_date');\n                              window.location.href = '/';\n                            });\n                          }`,
        `Swal.fire({\n                            title: 'Logout',\n                            text: 'Are you sure you want to log out?',\n                            icon: 'question',\n                            showCancelButton: true,\n                            confirmButtonText: 'Yes, logout'\n                          }).then((result) => {\n                            if (result.isConfirmed) {\n                              api.post('/logout').catch(console.error).finally(() => {\n                                localStorage.removeItem('auth_token');\n                                localStorage.removeItem('login_date');\n                                window.location.href = '/';\n                              });\n                            }\n                          });`
    ]
]);

// 7. Staff.jsx
replaceFileContent(path.join(__dirname, 'resources', 'js', 'pages', 'Staff.jsx'), [
    [
        `if(confirm(\`Are you sure you want to mark \${s.name} as \${newStatus}?\`)) {\n      api.put(\`/staff/\${s.id}\`, { status: newStatus })\n        .then(() => fetchStaff())\n        .catch(err => Swal.fire(err.response?.data?.message || 'Error updating status.'));\n    }`,
        `Swal.fire({\n      title: 'Are you sure?',\n      text: \`Are you sure you want to mark \${s.name} as \${newStatus}?\`,\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonText: 'Yes'\n    }).then((result) => {\n      if (result.isConfirmed) {\n        api.put(\`/staff/\${s.id}\`, { status: newStatus })\n          .then(() => fetchStaff())\n          .catch(err => Swal.fire(err.response?.data?.message || 'Error updating status.'));\n      }\n    });`
    ]
]);

console.log('Successfully replaced all confirms!');
