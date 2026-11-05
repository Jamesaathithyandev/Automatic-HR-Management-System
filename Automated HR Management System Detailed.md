# HRMS – Human Resource Management System

## 1. Introduction

An **HRMS (Human Resource Management System)** is a software platform used by companies to manage their employees throughout their employment lifecycle.

It handles everything from recruitment and onboarding to attendance, payroll, performance management and offboarding.

### Main objectives

- Centralize employee information.
    
- Automate repetitive HR operations.
    
- Manage employee attendance and leave.
    
- Simplify payroll processing.
    
- Improve communication between employees, managers and HR.
    
- Track employee performance and growth.
    
- Maintain employee documents securely.
    

---

## 2. Feature Priorities

|Priority|Meaning|Purpose|
|---|---|---|
|P1|Must-have|Essential features required for launch|
|P2|Important|Features to add shortly after launch|
|P3|Advanced|Nice-to-have and advanced capabilities|

**Examples:**

- P1: Employee leave application and approval.
    
- P2: Leave approval through Slack.
    
- P3: AI-based employee analytics.
    

---

# 3. Core HRMS Modules

## 3.1 Core Platform

**Purpose:** Provides the foundation for the entire HRMS application.

It manages authentication, authorization, user roles, security and system-wide functionality.

### User roles

|Role|Responsibilities|
|---|---|
|Employee|View profile, apply for leave, download payslips|
|Manager|Manage team, approve leave, review performance|
|HR|Manage employees, recruitment, onboarding and policies|
|Admin|Manage system settings, permissions and integrations|
|Founder|Access company-wide information and business reports|

### Important concepts

- **RBAC (Role-Based Access Control):** Controls application access based on user roles.
    
- **SSO (Single Sign-On):** Allows users to log in using Google Workspace or Microsoft accounts.
    
- **2FA (Two-Factor Authentication):** Adds another verification step during login.
    
- **Audit Logs:** Records who performed an action, when it happened and what was changed.
    
- **Notifications:** Sends alerts for important activities.
    
- **Global Search:** Allows searching across employees, documents and company policies.
    

### Example

When an HR employee changes an employee's salary, the system records:

- Who made the change.
    
- When the change happened.
    
- What the previous value was.
    
- What the new value is.
    

**Priority:** P1 – Login, roles and audit logs.

---

## 3.2 Employee Management

**Purpose:** Maintains a centralized digital database of all employees.

### Employee profile information

- Name, email and phone number.
    
- Employee ID.
    
- Department and designation.
    
- Joining date.
    
- Reporting manager.
    
- Salary information.
    
- Bank details.
    
- Emergency contacts.
    
- Employment status.
    

### Org Chart

An organizational chart represents the company's hierarchy.

Example:

```
Founder / CEO
    |
    |-- Engineering Manager
    |       |
    |       |-- Software Developers
    |
    |-- HR Manager
            |
            |-- HR Executives
```

The org chart should automatically update when reporting relationships change.

### Employee lifecycle

The system tracks employees through different employment stages:

1. Candidate
    
2. Probation
    
3. Confirmed
    
4. Notice Period
    
5. Exited
    

### Additional capabilities

- Employment history.
    
- Promotions and transfers.
    
- Salary revisions.
    
- Employee profile change requests.
    
- Skills and certifications.
    

**Priority:** P1 – Employee profiles, directory and org chart.

---

## 3.3 Recruitment (ATS)

**ATS = Applicant Tracking System**

**Purpose:** Manages the complete recruitment and hiring process.

### Recruitment workflow

```
Applied
   |
Screening
   |
Interview
   |
Selected
   |
Offer Sent
   |
Hired
   |
Onboarding
```

### Main functionalities

- Job posting and careers page.
    
- Candidate pipeline management.
    
- Resume collection.
    
- Interview scheduling.
    
- Interview feedback and scorecards.
    
- Automated candidate emails.
    
- Offer letter generation.
    
- Candidate tracking.
    

### AI capabilities (P3)

- Resume parsing.
    
- AI-based candidate ranking.
    
- Candidate matching against job requirements.
    
- Hiring analytics.
    

### Example

A company wants to hire three Java developers.

HR publishes the job opening, receives applications, screens candidates, schedules interviews and sends offer letters to selected candidates.

**Priority:** P2 – Complete recruitment management.  
**P1 dependency:** Basic offer letter generation.

---

## 3.4 Onboarding

**Purpose:** Manages the process of bringing a newly hired employee into the organization.

Onboarding starts when a candidate accepts an offer.

### Onboarding workflow

1. Candidate accepts the offer.
    
2. HR receives an onboarding notification.
    
3. System generates an onboarding checklist.
    
4. Employee uploads identity and educational documents.
    
5. HR verifies the documents.
    
6. Employee signs employment contract and NDA.
    
7. IT receives an account creation request.
    
8. Manager receives initial task assignments.
    
9. Probation tracking begins.
    

### Additional functionalities

- Equipment requests.
    
- Email and software account provisioning.
    
- Pre-boarding portal.
    
- Buddy or mentor assignment.
    
- 30/60/90-day plans.
    
- Welcome announcements.
    
- Probation review reminders.
    

**Priority:** P1 – Checklist, document collection, e-signatures, task assignments and probation tracking.

---

## 3.5 Attendance and Time Management

**Purpose:** Tracks employee working time and attendance.

### Supported work arrangements

- Remote work.
    
- Office work.
    
- Hybrid work.
    
- Shift-based work.
    
- Flexible working hours.
    

### Main functionalities

- Optional check-in and check-out.
    
- Project-based timesheets.
    
- Overtime tracking.
    
- Attendance regularization.
    
- Working-hour preferences.
    
- Shift management.
    

### Important distinction

|Attendance|Timesheet|
|---|---|
|Tracks when an employee works|Tracks how working time is distributed|
|Records attendance status|Records time spent on tasks or projects|

### Example

A remote employee may not need mandatory daily check-in.

The company can use leave-based attendance, where employees are considered available unless they have approved leave.

**Priority:** P1 – Leave-based attendance.  
**P2 –** Check-in/check-out and timesheets.

---

## 3.6 Leave Management

**Purpose:** Manages employee holidays, leave requests, approvals and leave balances.

### Leave types

- Casual Leave (CL).
    
- Sick Leave (SL).
    
- Earned Leave (EL).
    
- Parental Leave.
    
- Unpaid Leave.
    

### Leave application workflow

```
Employee submits request
          |
          v
    Manager notified
          |
          v
   Manager reviews
          |
     +----+----+
     |         |
   Approve   Reject
     |         |
     v         v
  Balance    Employee
  updated    notified
```

### Leave policy configuration

HR should be able to configure:

- Annual leave allocation.
    
- Monthly leave accrual.
    
- Carry-forward rules.
    
- Maximum leave limits.
    
- Probation restrictions.
    
- Half-day and hourly leave.
    

### Example leave balance

|Leave Type|Available|
|---|---|
|Casual Leave|5 days|
|Sick Leave|4 days|
|Earned Leave|12 days|
|Unpaid Leave|As required|

### Additional functionalities

- Team leave calendar.
    
- Leave conflict alerts.
    
- Delegate approvers.
    
- Automatic approval escalation.
    
- Leave encashment.
    

**Priority:** P1 – Leave policies, approvals and team calendar.

---

## 3.7 Payroll and Compensation

**Purpose:** Calculates employee salaries and manages monthly payroll processing.

### Example salary structure

|Component|Amount|
|---|---|
|Basic Salary|₹20,000|
|HRA|₹8,000|
|Other Allowances|₹5,000|
|Gross Salary|₹33,000|
|Deductions|₹2,000|
|Net Salary|₹31,000|

### Main functionalities

- Salary structure management.
    
- Monthly payroll processing.
    
- Attendance and leave inputs.
    
- Tax deductions.
    
- Provident Fund (PF), where applicable.
    
- Employee State Insurance (ESI), where applicable.
    
- Payslip generation.
    
- Bonuses and incentives.
    
- Reimbursements.
    
- Salary revisions.
    

### Important consideration

Payroll is legally sensitive.

Instead of implementing every statutory calculation independently, integrate with a reliable payroll provider.

For Indian companies, applicable Indian payroll, tax and labour compliance requirements must be considered.

**Priority:** P1 – Payroll through a provider and payslip access.

---

## 3.8 Documents and Letters

**Purpose:** Provides secure digital storage and management of employee documents.

### Employee document vault

Each employee has a dedicated document storage area.

Examples:

- Identity documents.
    
- PAN details.
    
- Educational certificates.
    
- Employment agreements.
    
- Offer letters.
    
- Appointment letters.
    
- Experience certificates.
    
- Relieving letters.
    
- Appraisal letters.
    

### Document generation

HR can generate documents using predefined templates.

Example:

An offer letter template automatically receives:

- Employee name.
    
- Designation.
    
- Salary.
    
- Joining date.
    
- Department.
    

The system generates the final document for digital signing.

### Additional functionalities

- E-signature integration.
    
- Document expiry reminders.
    
- Policy version history.
    
- Policy acknowledgment tracking.
    
- Employee handbook.
    
- Document request workflows.
    

**Priority:** P1 – Secure document vault, templates, e-signatures and policy management.

---

## 3.9 Performance and Growth

**Purpose:** Evaluates employee performance and supports professional development.

### Main functionalities

- Self-assessments.
    
- Manager reviews.
    
- Peer reviews.
    
- 360-degree feedback.
    
- Goal and OKR tracking.
    
- Continuous feedback.
    
- One-on-one meetings.
    
- Performance review reminders.
    

### Example performance goals

|Goal|Target|
|---|---|
|Complete assigned tasks|95%|
|Reduce application bugs|20%|
|Improve API response time|30%|

Managers can monitor progress and conduct periodic performance reviews.

### Advanced functionalities

- Competency frameworks.
    
- Career ladders.
    
- Promotion recommendations.
    
- Performance Improvement Plans (PIP).
    
- Succession planning.
    

**Priority:** P2 – Goals, OKRs and performance reviews.

---

## 3.10 Learning and Development

**Purpose:** Manages employee training, education and skill development.

### Main functionalities

- Course assignments.
    
- Training budgets.
    
- Mandatory training.
    
- Certification tracking.
    
- Course completion monitoring.
    
- Learning progress reports.
    

### Example

A company assigns:

- Java training to backend developers.
    
- React training to frontend developers.
    
- Leadership training to managers.
    
- Security awareness training to all employees.
    

### Advanced functionalities

- Skill gap analysis.
    
- Internal knowledge library.
    
- Learning Management System (LMS) integration.
    
- Mentorship matching.
    

**Priority:** P2 – Training and learning management.

---

## 3.11 Engagement and Culture

**Purpose:** Improves employee satisfaction and workplace culture.

### Main functionalities

- Company announcements.
    
- Employee birthdays.
    
- Work anniversaries.
    
- Anonymous employee surveys.
    
- Employee recognition.
    
- Peer appreciation.
    
- Company events.
    
- Employee suggestions.
    
- Grievance reporting.
    

### Example

HR conducts a monthly anonymous survey:

"How satisfied are you with your current workload?"

Employees submit responses, and HR reviews the overall feedback.

### Advanced functionalities

- eNPS tracking.
    
- Virtual team-building events.
    
- Employee wellness check-ins.
    
- Burnout indicators.
    
- Anonymous feedback channels.
    

**Priority:** P1 – Company announcements.  
**P2 –** Surveys, recognition and grievance management.

---

## 3.12 Assets and IT Management

**Purpose:** Tracks company-owned equipment, hardware and software.

### Main functionalities

- Laptop inventory.
    
- Equipment assignment.
    
- Asset return tracking.
    
- Equipment condition records.
    
- Software license assignment.
    
- Home-office allowances.
    
- Internet allowances.
    

### Example workflow

When an employee joins:

1. IT assigns a laptop.
    
2. An asset ID is generated.
    
3. Equipment condition is recorded.
    
4. Employee acknowledges receipt.
    

When an employee exits, IT receives a request to recover the equipment.

**Priority:** P2 – Asset inventory and tracking.  
**P1 –** Access revocation checklist during exit.

---

## 3.13 Offboarding

**Purpose:** Manages the complete process when an employee leaves the organization.

### Offboarding workflow

```
Employee submits resignation
             |
             v
     Manager reviews
             |
             v
     Notice period starts
             |
             v
      Exit checklist
             |
       +-----+-----+
       |     |     |
      IT    HR   Manager
       |     |     |
       v     v     v
     Access Documents Knowledge
     removal       transfer
       |
       v
   Asset recovery
       |
       v
 Final settlement
       |
       v
 Experience and relieving letters
       |
       v
   Employee exited
```

### Main functionalities

- Resignation submission.
    
- Resignation approval.
    
- Notice period tracking.
    
- Exit checklist.
    
- Asset recovery.
    
- Account deactivation.
    
- Knowledge transfer.
    
- Exit interviews.
    
- Full and final settlement.
    
- Experience and relieving letters.
    

### Important consideration

When an employee exits, the system should trigger access revocation and prevent unauthorized access to company systems.

**Priority:** P1 – Resignation, notice period, exit checklist and exit letters.

---

## 3.14 Employee Self-Service and Support

**Purpose:** Allows employees to manage their HR-related requirements independently.

### Employee self-service portal

Employees can:

- Download payslips.
    
- View leave balances.
    
- Apply for leave.
    
- Update profile information.
    
- Download employment letters.
    
- Read company policies.
    
- Raise HR support tickets.
    

### HR Helpdesk

Employees can create support tickets for HR-related issues.

Example:

"I cannot download my September payslip."

HR receives the ticket and resolves the issue.

### Additional functionalities

- Ticket assignment.
    
- SLA tracking.
    
- FAQ section.
    
- Knowledge base.
    
- HR chatbot.
    

**Priority:** P1 – Employee self-service portal.  
**P2 –** HR helpdesk and FAQ.

---

## 3.15 Manager Tools

**Purpose:** Provides managers with a centralized view of their teams.

### Manager dashboard

Managers can view:

- Total team members.
    
- Employees currently on leave.
    
- Pending leave approvals.
    
- Upcoming probation reviews.
    
- Employee performance goals.
    
- One-on-one meetings.
    
- Hiring requests.
    

### Example

A manager handling 15 developers can monitor the entire team through one dashboard instead of checking each employee individually.

**Priority:** P1 – Team dashboard and pending approvals.  
**P2 –** Team calendar and hiring requests.

---

## 3.16 Analytics and Reporting

**Purpose:** Converts employee information into useful business insights.

### Important HR metrics

- Total employee headcount.
    
- Number of new joiners.
    
- Number of employee exits.
    
- Employee attrition rate.
    
- Leave utilization.
    
- Absenteeism trends.
    
- Payroll expenses.
    
- Employee engagement scores.
    

### Example dashboard

|Metric|Value|
|---|---|
|Total Employees|125|
|New Joiners|8|
|Employee Exits|2|
|Employees on Leave|7|

_Illustrative data._

### Advanced functionalities

- Custom report builder.
    
- Scheduled report exports.
    
- Diversity and inclusion metrics.
    
- Predictive attrition analysis.
    
- Burnout risk analysis.
    

**Priority:** P1 – Basic headcount and workforce dashboard.  
**P2 –** Attrition, leave and payroll reports.

---

## 3.17 Compliance and Security

**Purpose:** Protects employee information and ensures the platform follows applicable legal and organizational requirements.

HRMS platforms store sensitive information such as:

- Bank details.
    
- Salary information.
    
- Identity documents.
    
- Contact information.
    
- Employment contracts.
    

### Important security concepts

- **Encryption:** Protects information during storage and transmission.
    
- **Field-Level Protection:** Restricts access to sensitive information.
    
- **Data Retention:** Defines how long information is stored.
    
- **Data Deletion:** Handles deletion requests according to applicable requirements.
    
- **Employee Consent:** Records consent and privacy acknowledgments.
    
- **Backups:** Protects against data loss.
    
- **Disaster Recovery:** Restores the application after major failures.
    

### Additional functionalities

- Personal data export.
    
- Admin IP restrictions.
    
- Compliance calendar.
    
- Device restrictions.
    
- Backup and recovery policies.
    

For Indian deployments, consider applicable requirements under the Digital Personal Data Protection Act and relevant employment and tax regulations.

**Priority:** P1 – Encryption, privacy, data retention and backups.

---

## 3.18 Automation and AI Layer

**Purpose:** Reduces repetitive HR tasks through automated workflows and intelligent assistance.

### Workflow automation

An automation consists of:

1. Trigger – An event occurs.
    
2. Condition – The system checks specific criteria.
    
3. Action – The system performs an operation.
    

### Example: Probation reminder

**Trigger:** Employee probation ends in seven days.

**Actions:**

1. Notify the manager.
    
2. Notify HR.
    
3. Create a probation review task.
    
4. Send a reminder to complete the review.
    

### Other automation examples

|Trigger|Automated Action|
|---|---|
|Employee joins|Create onboarding checklist|
|Leave requested|Notify manager|
|Contract expiring|Notify HR|
|Employee resigns|Start offboarding|
|Payslip generated|Notify employee|
|Policy updated|Request acknowledgment|

### AI capabilities

- AI policy assistant.
    
- AI-generated job descriptions.
    
- AI-drafted performance reviews.
    
- AI-generated employment letters.
    
- Survey response summaries.
    
- Payroll anomaly detection.
    
- Natural-language reporting.
    

### Example

Founder asks:

"Show me the employees who joined in the last three months."

The AI interprets the question and generates a report using company data.

**Priority:** P1 – Smart reminders.  
**P2 –** Rules engine and workflow automation.  
**P3 –** Advanced AI features.

---

## 3.19 Integrations

**Purpose:** Connects the HRMS with external applications and services.

The HRMS should communicate with other software rather than operating independently.

### Important integrations

|Integration|Purpose|
|---|---|
|Google Workspace|Email, calendar and SSO|
|Microsoft 365|Email, calendar and SSO|
|Slack|Notifications and approvals|
|Microsoft Teams|Notifications and approvals|
|Payroll Provider|Salary processing|
|E-signature Provider|Digital contract signing|
|Tally|Accounting|
|Zoho Books|Accounting|
|LinkedIn|Recruitment|
|Naukri|Recruitment|

### Example integration workflow

```
Employee applies for leave
          |
          v
HRMS receives request
          |
          v
Slack notification sent
          |
          v
Manager approves leave
          |
          v
HRMS updates leave balance
          |
          v
Attendance records updated
```

**Priority:** P1 – Slack, Teams, Google Workspace, Microsoft 365, payroll and e-signature integrations.

---

# 4. How All Modules Connect Together

The 19 modules are not independent applications. They are interconnected parts of one HRMS platform.

### Complete Employee Lifecycle

```
Recruitment
    |
    v
Offer Management
    |
    v
Onboarding
    |
    v
Employee Management
    |
    v
Attendance & Leave
    |
    v
Payroll
    |
    v
Performance & Learning
    |
    v
Offboarding
```

### Role of the Central Employee Database

The employee database acts as the central source of information for the entire application.

For example:

- Employee management stores employee information.
    
- Leave management uses the employee ID to track leave.
    
- Attendance uses the same employee record.
    
- Payroll uses employee salary information.
    
- Performance management uses the employee's department and reporting manager.
    
- Offboarding updates the employee's employment status.
    

**Important:** Employee information should be created once and reused across all relevant modules instead of maintaining separate employee records.

---

# 5. Development Roadmap

Instead of developing all P1 features simultaneously, organize development into phases.

|Phase|Modules|Main Objective|
|---|---|---|
|Phase 1|Core Platform|Authentication, permissions and security|
|Phase 2|Employee Management|Employee records and organization|
|Phase 3|Leave Management|Leave policies, approvals and calendars|
|Phase 4|Onboarding & Documents|Employee onboarding and digital letters|
|Phase 5|Payroll|Provider integration and payslips|
|Phase 6|Offboarding|Resignation and exit workflows|
|Phase 7|Notifications & Analytics|Alerts and management dashboards|

### Important development decision

A complete recruitment system is P2, but offer letter generation is P1.

Therefore, the initial version can support manually created candidate records and offer letters without building the entire ATS.

---

# 6. Suggested Technical Architecture

For a modern HRMS SaaS platform, a **Modular Monolith Architecture** is a good starting point.

A modular monolith keeps the application in one deployable backend while organizing business functionality into separate modules.

### Frontend

**React / Next.js + TypeScript**

Used for:

- Employee portal.
    
- HR dashboard.
    
- Manager dashboard.
    
- Admin panel.
    
- Founder dashboard.
    

### Backend

**Node.js + NestJS**

Responsible for:

- Authentication.
    
- Role-Based Access Control.
    
- Business logic.
    
- API development.
    
- Workflow engine.
    
- Integrations.
    

### Database and Infrastructure

|Technology|Purpose|
|---|---|
|PostgreSQL|Main relational database|
|Redis|Caching and queues|
|Object Storage|Documents and files|
|Background Jobs|Reminders and automated tasks|

### Architecture Overview

```
             FRONTEND
       React / Next.js
              |
              v
          BACKEND API
            NestJS
              |
     +--------+--------+
     |        |        |
     v        v        v
 PostgreSQL  Redis  Background
 Database    Cache     Jobs
     |
     v
 Employee, Payroll,
 Leave and HR Data

              |
              v
      EXTERNAL SERVICES

   Google Workspace
   Microsoft 365
   Slack / Teams
   Payroll Provider
   E-Signature Provider
```

### Why this technology stack?

- **React/Next.js:** Builds the user interfaces.
    
- **TypeScript:** Improves code reliability and maintainability.
    
- **NestJS:** Organizes a large backend into independent modules.
    
- **PostgreSQL:** Stores relational employee, payroll, attendance and leave data.
    
- **Redis:** Supports caching and background tasks.
    
- **Object Storage:** Stores documents and contracts securely.
    

### Multi-Tenant Architecture

If the HRMS will be offered to multiple companies as a SaaS product, it must support multiple tenants.

A tenant represents one company using the platform.

Example:

```
HRMS Platform
    |
    |-- Company A
    |      |-- Employees
    |      |-- HR
    |      |-- Managers
    |
    |-- Company B
    |      |-- Employees
    |      |-- HR
    |      |-- Managers
    |
    |-- Company C
           |-- Employees
           |-- HR
           |-- Managers
```

Each company must have isolated employee records, documents, payroll information and configurations.

Tenant isolation should be designed from the beginning.

---

# 7. Existing HRMS Products

Examples of established HRMS platforms:

1. Zoho People
    
2. Keka HR
    
3. Darwinbox
    
4. BambooHR
    
5. Rippling
    

These products provide examples of how different HR functions can be integrated into one platform.

---

# 8. Final Product Strategy

The objective is to build a comprehensive HRMS platform covering the complete employee lifecycle.

### Recommended initial focus

1. Authentication and role management.
    
2. Employee management.
    
3. Leave management.
    
4. Onboarding.
    
5. Document management.
    
6. Payroll integration.
    
7. Offboarding.
    
8. Notifications.
    
9. Basic analytics.
    

### Future expansion

- Complete recruitment system.
    
- Performance management.
    
- Learning management.
    
- Employee engagement.
    
- Asset management.
    
- Advanced reporting.
    
- Workflow automation.
    

### Key Architectural Decisions

- Use a modular monolith initially.
    
- Build a multi-tenant SaaS architecture.
    
- Use PostgreSQL as the primary database.
    
- Implement RBAC from the beginning.
    
- Maintain centralized employee records.
    
- Implement audit logging for sensitive operations.
    
- Use external providers for payroll and e-signatures.
    
- Design secure document storage.
    
- Build reusable workflows and notification services.
    