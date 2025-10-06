import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword('ChangeMe123!');
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash,
        role: Role.SUPER_ADMIN,
        mustChangePassword: true
      }
    });
    console.log('Seeded super admin account: admin@example.com / ChangeMe123!');
  }

  const apps = [
    {
      name: 'Salesforce',
      loginUrl: 'https://login.salesforce.com',
      description: 'CRM for sales and account teams',
      categories: ['Sales', 'CRM'],
      iconUrl: 'https://logo.clearbit.com/salesforce.com',
      featured: true
    },
    {
      name: 'Workday',
      loginUrl: 'https://www.myworkday.com',
      description: 'HR and finance management',
      categories: ['HR', 'Finance'],
      iconUrl: 'https://logo.clearbit.com/workday.com'
    },
    {
      name: 'NetSuite',
      loginUrl: 'https://system.netsuite.com/pages/customerlogin.jsp',
      description: 'ERP for finance operations',
      categories: ['Finance'],
      iconUrl: 'https://logo.clearbit.com/netsuite.com'
    },
    {
      name: 'Zendesk',
      loginUrl: 'https://subdomain.zendesk.com',
      description: 'Customer support ticketing',
      categories: ['Support'],
      iconUrl: 'https://logo.clearbit.com/zendesk.com'
    },
    {
      name: 'Jira',
      loginUrl: 'https://id.atlassian.com/login',
      description: 'Project tracking for engineering and ops',
      categories: ['Engineering', 'Ops'],
      iconUrl: 'https://logo.clearbit.com/atlassian.com'
    },
    {
      name: 'Tableau Cloud',
      loginUrl: 'https://prod-useast-b.online.tableau.com/',
      description: 'Analytics dashboards and reporting',
      categories: ['Analytics'],
      iconUrl: 'https://logo.clearbit.com/tableau.com'
    },
    {
      name: 'ServiceNow',
      loginUrl: 'https://login.servicenow.com',
      description: 'IT service management platform',
      categories: ['IT', 'Ops'],
      iconUrl: 'https://logo.clearbit.com/servicenow.com'
    },
    {
      name: 'Concur',
      loginUrl: 'https://www.concursolutions.com/',
      description: 'Travel and expense management',
      categories: ['Finance', 'Ops'],
      iconUrl: 'https://logo.clearbit.com/concur.com'
    }
  ];

  for (const app of apps) {
    await prisma.app.upsert({
      where: { name: app.name },
      update: app,
      create: app
    });
  }

  console.log('Seeded applications');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
