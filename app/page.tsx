"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Settings,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

type Transaction = {
  id: number;
  name: string;
  category: string;
  date: string;
  value: number;
  type: "income" | "expense";
};
type GoalContribution = { id: number; value: number; createdAt: string };
type Goal = {
  id: number;
  name: string;
  current: number;
  target: number;
  contributions?: GoalContribution[];
};
type Account = { id: number; name: string; type: string; value: number };
type Budget = { id: number; category: string; limit: number };
type Recurrence = {
  id: number;
  name: string;
  category: string;
  value: number;
  active: boolean;
};
type User = {
  id: number;
  name: string;
  email: string;
  plan?: "basic" | "premium";
  planStatus?: string;
};

const initialTransactions: Transaction[] = [];
const initialGoals: Goal[] = [
  { id: 1, name: "Viagem para Europa eu e  fran", current: 0, target: 0 },
  { id: 2, name: "Reserva de emergência", current: 0, target: 0 },
];
const initialAccounts: Account[] = [
  { id: 1, name: "Nubank principal", type: "Conta corrente", value: 0 },
  { id: 2, name: "Cartão Platinum", type: "Fatura atual", value: 0 },
];
const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
const categories = [
  "Salário",
  "Alimentação",
  "Moradia",
  "Transporte",
  "Lazer",
  "Renda extra",
  "Pensão",
  "Imprevistos",
  "Carro",
  "Gasolina",
  "Manutenção do carro",
  "Contas da casa",
  "Água",
  "Energia elétrica",
  "Internet",
  "Telefone",
  "Saúde",
  "Farmácia",
  "Educação",
  "Roupas",
  "Assinaturas",
  "Presentes",
  "Viagens",
  "Impostos",
  "Seguros",
  "Pets",
  "Dívidas",
  "Outros",
];
const currentDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
}).format(new Date());
const parseTransactionDate = (value: string) => {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
};

function Budgets({
  budgets,
  transactions,
  onAdd,
  onDelete,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  onAdd: (category: string, limit: number) => void;
  onDelete: (id: number) => void;
}) {
  const [category, setCategory] = useState("Alimentação");
  const [limit, setLimit] = useState("");
  const options = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer",
    "Saúde",
    "Assinaturas",
    "Outros",
  ];
  return (
    <div className="space-y-6 px-5 py-7 md:px-10">
      <div>
        <h2 className="text-2xl font-semibold">Orçamentos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina limites e acompanhe seus gastos por categoria.
        </p>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 md:flex-row">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-3"
        >
          {options.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
          type="number"
          min="1"
          placeholder="Limite mensal (R$)"
          className="rounded-xl border border-border bg-background px-3 py-3"
        />
        <button
          onClick={() => {
            const value = Number(limit.replace(",", "."));
            if (value > 0) {
              onAdd(category, value);
              setLimit("");
            }
          }}
          className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
        >
          Criar orçamento
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.length ? (
          budgets.map((budget) => {
            const spent = transactions
              .filter(
                (item) =>
                  item.type === "expense" && item.category === budget.category,
              )
              .reduce((sum, item) => sum + item.value, 0);
            const percent = Math.min(100, (spent / budget.limit) * 100);
            return (
              <article
                key={budget.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {money(spent)} de {money(budget.limit)}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(budget.id)}
                    aria-label={`Excluir orçamento ${budget.category}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-5 h-3 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${percent >= 100 ? "bg-destructive" : percent >= 80 ? "bg-chart-4" : "bg-primary"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.round(percent)}% utilizado
                </p>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Crie seu primeiro orçamento.
          </div>
        )}
      </div>
    </div>
  );
}

function Recurrences({
  items,
  onAdd,
  onDelete,
}: {
  items: Recurrence[];
  onAdd: (name: string, category: string, value: number) => void;
  onDelete: (id: number) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Assinaturas");
  const [value, setValue] = useState("");
  return (
    <div className="space-y-6 px-5 py-7 md:px-10">
      <div>
        <h2 className="text-2xl font-semibold">Recorrências</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize despesas fixas como aluguel, assinaturas e contas.
        </p>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 md:flex-row">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome da recorrência"
          className="rounded-xl border border-border bg-background px-3 py-3"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-3"
        >
          <option>Assinaturas</option>
          <option>Moradia</option>
          <option>Contas da casa</option>
          <option>Outros</option>
        </select>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          type="number"
          min="1"
          placeholder="Valor mensal (R$)"
          className="rounded-xl border border-border bg-background px-3 py-3"
        />
        <button
          onClick={() => {
            const amount = Number(value.replace(",", "."));
            if (name.trim() && amount > 0) {
              onAdd(name.trim(), category, amount);
              setName("");
              setValue("");
            }
          }}
          className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
        >
          Adicionar
        </button>
      </div>
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-5"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.category} · {money(item.value)} por mês
                </p>
              </div>
              <button
                onClick={() => onDelete(item.id)}
                aria-label={`Excluir recorrência ${item.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma recorrência cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [active, setActive] = useState("Visão geral");
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [period, setPeriod] = useState("Este mês");
  const [notifications, setNotifications] = useState(false);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [financeError, setFinanceError] = useState("");
  const [saving, setSaving] = useState(false);
  const expenseCategories = categories.filter(
    (c) => c !== "Salário" && c !== "Renda extra",
  );
  const [form, setForm] = useState({
    name: "",
    value: "",
    category: expenseCategories[0],
    type: "expense" as "income" | "expense",
  });
  const [continueAdding, setContinueAdding] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: "", target: "" });
  const [accountModal, setAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "Conta corrente",
    value: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => undefined)
      .finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => {
    if (!user) return;
    fetch("/api/finance")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(
            data.error ?? "Não foi possível carregar seus dados.",
          );
        return data;
      })
      .then((data) => {
        setTransactions(data.transactions);
        setGoals(data.goals);
        setAccounts(data.accounts);
        setBudgets(data.budgets ?? []);
        setRecurrences(data.recurrences ?? []);
        setFinanceError("");
      })
      .catch((error) => {
        console.error(error);
        setFinanceError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar seus dados.",
        );
      });
  }, [user]);
  const financeRequest = async (
    method: string,
    resource: string,
    data?: Record<string, unknown>,
    id?: number,
  ) => {
    setSaving(true);
    setFinanceError("");
    try {
      const response = await fetch("/api/finance", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, data, id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error ??
            `Não foi possível salvar os dados (${response.status}).`,
        );
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados.";
      setFinanceError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const visibleTransactions = useMemo(() => {
    const now = new Date();
    const start =
      period === "Este mês"
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : period === "Últimos 3 meses"
          ? new Date(now.getFullYear(), now.getMonth() - 2, 1)
          : new Date(now.getFullYear(), 0, 1);
    const end =
      period === "Este ano"
        ? new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return transactions.filter((transaction) => {
      const date = parseTransactionDate(transaction.date);
      return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });
  }, [period, transactions]);
  const income = useMemo(
    () =>
      visibleTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.value, 0),
    [visibleTransactions],
  );
  const expenses = useMemo(
    () =>
      visibleTransactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.value, 0),
    [visibleTransactions],
  );
  const balance = income - expenses;
  const mask = hidden ? "••••••" : undefined;
  const display = (n: number) => mask ?? money(n);
  const addTransaction = async () => {
    const value = Number(form.value.replace(",", "."));
    if (!form.name.trim() || !value || value < 0) return;
    const transaction = await financeRequest("POST", "transaction", {
      name: form.name.trim(),
      category: form.category,
      date: new Date().toLocaleDateString("pt-BR"),
      value,
      type: form.type,
    });
    setTransactions([transaction, ...transactions]);
    setForm({
      name: "",
      value: "",
      category: expenseCategories[0],
      type: "expense",
    });
    if (!continueAdding) setModal(false);
  };
  const addGoal = async () => {
    const target = Number(goalForm.target.replace(",", "."));
    if (!goalForm.name.trim() || !target) return;
    const goal = await financeRequest("POST", "goal", {
      name: goalForm.name.trim(),
      current: 0,
      target,
    });
    setGoals([...goals, goal]);
    setGoalForm({ name: "", target: "" });
    setGoalModal(false);
  };
  const addContribution = async (goalId: number) => {
    const rawValue = window.prompt("Valor do aporte (R$)");
    if (!rawValue) return;
    const value = Number(rawValue.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    await financeRequest("POST", "goalContribution", { goalId, value });
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              current: goal.current + value,
              contributions: [
                { id: Date.now(), value, createdAt: new Date().toISOString() },
                ...(goal.contributions ?? []),
              ],
            }
          : goal,
      ),
    );
  };
  const updateGoal = async (id: number, patch: Partial<Goal>) => {
    await financeRequest("PATCH", "goal", patch as Record<string, unknown>, id);
    setGoals(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };
  const deleteGoal = async (id: number) => {
    await financeRequest("DELETE", "goal", undefined, id);
    setGoals(goals.filter((g) => g.id !== id));
  };
  const openAccountEditor = (account?: Account) => {
    setEditingAccount(account ?? null);
    setAccountForm(
      account
        ? {
            name: account.name,
            type: account.type,
            value: String(account.value),
          }
        : { name: "", type: "Conta corrente", value: "" },
    );
    setAccountModal(true);
  };
  const saveAccount = async () => {
    const value = Number(accountForm.value.replace(",", "."));
    if (!accountForm.name.trim() || Number.isNaN(value) || value < 0) return;
    const data = {
      name: accountForm.name.trim(),
      type: accountForm.type,
      value,
    };
    if (editingAccount) {
      await financeRequest("PATCH", "account", data, editingAccount.id);
      setAccounts(
        accounts.map((a) =>
          a.id === editingAccount.id ? { ...a, ...data } : a,
        ),
      );
    } else {
      const account = await financeRequest("POST", "account", data);
      setAccounts([...accounts, account]);
    }
    setAccountModal(false);
  };
  const addBudget = async (category: string, limit: number) => {
    const budget = await financeRequest("POST", "budget", { category, limit });
    setBudgets([...budgets, budget]);
  };
  const deleteBudget = async (id: number) => {
    await financeRequest("DELETE", "budget", undefined, id);
    setBudgets(budgets.filter((item) => item.id !== id));
  };
  const addRecurrence = async (
    name: string,
    category: string,
    value: number,
  ) => {
    const result = await financeRequest("POST", "recurrence", {
      name,
      category,
      value,
    });
    setRecurrences([...recurrences, result.recurrence]);
    setTransactions([result.transaction, ...transactions]);
  };
  const deleteRecurrence = async (id: number) => {
    await financeRequest("DELETE", "recurrence", undefined, id);
    setRecurrences(recurrences.filter((item) => item.id !== id));
  };
  const exportCsv = () => {
    const rows = [
      ["Descrição", "Categoria", "Data", "Valor", "Tipo"],
      ...transactions.map((item) => [
        item.name,
        item.category,
        item.date,
        String(item.value).replace(".", ","),
        item.type === "income" ? "Receita" : "Despesa",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(";"),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = "nexa-finance-transacoes.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const nav = [
    ["Visão geral", LayoutDashboard],
    ["Transações", ArrowUpRight],
    ["Orçamentos", TrendingUp],
    ["Recorrências", CalendarDays],
    ["Metas", Target],
    ["Contas e cartões", CreditCard],
  ] as const;

  if (authLoading)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  if (!user)
    return (
      <AuthScreen
        onAuthenticated={setUser}
        error={authError}
        setError={setAuthError}
      />
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-sidebar px-5 py-6 lg:flex">
        <Brand />
        <Nav active={active} setActive={setActive} nav={nav} />
        <div className="mt-auto flex flex-col gap-5">
          <button
            onClick={() => setActive("Configurações")}
            className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground"
          >
            <Settings className="size-[18px]" />
            Configurações
          </button>
          <Profile user={user} />
        </div>
      </aside>
      <section className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-border px-5 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Abrir menu"
            >
              <Menu />
            </button>
            <div>
              <p className="text-sm text-muted-foreground">{currentDate}</p>
              <h1 className="mt-1 text-2xl font-semibold">Olá, {user.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifications(!notifications)}
              className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground"
              aria-label="Notificações"
            >
              <Bell className="size-[18px]" />
            </button>
            <button
              onClick={exportCsv}
              className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground md:flex"
            >
              <Download className="size-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => {
                fetch("/api/auth/logout", { method: "POST" }).then(() =>
                  window.location.reload(),
                );
              }}
              className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground"
            >
              Sair
            </button>
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" />
              Nova transação
            </button>
          </div>
        </header>
        {mobileNav && (
          <div className="flex flex-wrap gap-2 border-b border-border p-4 lg:hidden">
            <Nav
              active={active}
              setActive={(v) => {
                setActive(v);
                setMobileNav(false);
              }}
              nav={nav}
            />
          </div>
        )}
        {notifications && (
          <div className="mx-5 mt-4 rounded-xl border border-border bg-card p-4 text-sm md:mx-10">
            <b>Notificações</b>
            <p className="mt-1 text-muted-foreground">
              Sua fatura vence em 5 dias. Você está dentro do orçamento mensal.
            </p>
          </div>
        )}
        {financeError && (
          <div
            role="alert"
            className="mx-5 mt-4 flex items-center justify-between gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive md:mx-10"
          >
            <span>{financeError}</span>
            <button
              onClick={() => setFinanceError("")}
              aria-label="Fechar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {saving && (
          <p className="fixed bottom-4 right-4 z-40 rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground shadow-lg">
            Salvando...
          </p>
        )}
        {active === "Visão geral" ? (
          <Dashboard
            {...{
              hidden,
              setHidden,
              period,
              setPeriod,
              display,
              income,
              expenses,
              balance,
              transactions: visibleTransactions,
              allTransactions: transactions,
              setTransactions,
              goals,
              setGoalModal,
              updateGoal,
              deleteGoal,
              accounts,
              onAddContribution: addContribution,
              onDeleteTransaction: async (id: number) => {
                if (!window.confirm("Excluir esta transação?")) return;
                await financeRequest("DELETE", "transaction", undefined, id);
                setTransactions(transactions.filter((t) => t.id !== id));
              },
            }}
          />
        ) : active === "Transações" ? (
          <Transactions
            transactions={transactions}
            setTransactions={setTransactions}
            onAdd={() => setModal(true)}
            onDelete={async (id: number) => {
              if (!window.confirm("Excluir esta transação?")) return;
              await financeRequest("DELETE", "transaction", undefined, id);
              setTransactions(transactions.filter((t) => t.id !== id));
            }}
          />
        ) : active === "Orçamentos" ? (
          <Budgets
            budgets={budgets}
            transactions={visibleTransactions}
            onAdd={addBudget}
            onDelete={deleteBudget}
          />
        ) : active === "Recorrências" ? (
          <Recurrences
            items={recurrences}
            onAdd={addRecurrence}
            onDelete={deleteRecurrence}
          />
        ) : active === "Metas" ? (
          <Goals
            goals={goals}
            setGoalModal={setGoalModal}
            onUpdate={updateGoal}
            onDelete={deleteGoal}
            onAddContribution={addContribution}
          />
        ) : active === "Contas e cartões" ? (
          <Accounts
            accounts={accounts}
            onEdit={openAccountEditor}
            onAdd={() => openAccountEditor()}
            onDelete={async (id: number) => {
              if (!window.confirm("Excluir esta conta ou cartão?")) return;
              await financeRequest("DELETE", "account", undefined, id);
              setAccounts(accounts.filter((a) => a.id !== id));
            }}
          />
        ) : (
          <SettingsPanel
            user={user}
            usage={{
              transactions: transactions.length,
              goals: goals.length,
              accounts: accounts.length,
            }}
          />
        )}
      </section>
      {modal && (
        <TransactionModal
          form={form}
          setForm={setForm}
          continueAdding={continueAdding}
          setContinueAdding={setContinueAdding}
          onClose={() => setModal(false)}
          onSave={addTransaction}
        />
      )}
      {goalModal && (
        <GoalModal
          form={goalForm}
          setForm={setGoalForm}
          onClose={() => setGoalModal(false)}
          onSave={addGoal}
        />
      )}
      {accountModal && (
        <AccountModal
          form={accountForm}
          setForm={setAccountForm}
          editing={Boolean(editingAccount)}
          onClose={() => setAccountModal(false)}
          onSave={saveAccount}
        />
      )}
    </main>
  );
}

function AuthScreen({
  onAuthenticated,
  error,
  setError,
}: {
  onAuthenticated: (user: User) => void;
  error: string;
  setError: (value: string) => void;
}) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch(
      registering ? "/api/auth/register" : "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      },
    );
    const data = await response.json();
    if (response.ok) onAuthenticated(data.user);
    else setError(data.error ?? "Não foi possível entrar.");
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </div>
          <div>
            <b>Nexa Finance</b>
            <p className="text-xs text-muted-foreground">Controle financeiro</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold">
          {registering ? "Crie sua conta" : "Bem-vindo de volta"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {registering
            ? "Comece a organizar suas finanças."
            : "Entre para acessar seus dados financeiros."}
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {registering && (
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome"
              className="rounded-xl border border-border bg-background px-3 py-3"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            className="rounded-xl border border-border bg-background px-3 py-3"
          />
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha (mínimo 6 caracteres)"
            className="rounded-xl border border-border bg-background px-3 py-3"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            disabled={loading}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Aguarde..." : registering ? "Criar conta" : "Entrar"}
          </button>
        </form>
        <button
          onClick={() => {
            setRegistering(!registering);
            setError("");
          }}
          className="mt-5 w-full text-sm text-primary"
        >
          {registering ? "Já tenho uma conta" : "Criar uma conta"}
        </button>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Wallet className="size-5" />
      </div>
      <b>Nexa Finance</b>
    </div>
  );
}
function Profile({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-5">
      <div className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold">
        {user.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          Plano {user.plan === "premium" ? "Premium" : "Basic"}
        </p>
      </div>
    </div>
  );
}
function Nav({
  active,
  setActive,
  nav,
}: {
  active: string;
  setActive: (v: string) => void;
  nav: readonly (readonly [string, any])[];
}) {
  return (
    <nav className="mt-10 flex flex-wrap gap-2 lg:flex-col">
      {nav.map(([label, Icon]) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active === label ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"}`}
        >
          <Icon className="size-[18px]" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function Dashboard(p: any) {
  const {
    hidden,
    setHidden,
    period,
    setPeriod,
    display,
    income,
    expenses,
    balance,
    transactions,
    allTransactions,
    setTransactions,
    goals,
    setGoalModal,
    updateGoal,
    deleteGoal,
    onAddContribution,
    onDeleteTransaction,
  } = p;
  return (
    <div className="min-w-0 space-y-6 px-5 py-7 md:px-10 md:py-9">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold">Visão geral</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe sua saúde financeira em um só lugar.
          </p>
        </div>
        <label className="flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent outline-none"
          >
            <option>Este mês</option>
            <option>Últimos 3 meses</option>
            <option>Este ano</option>
          </select>
          <ChevronDown className="size-4" />
        </label>
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <div className="flex justify-between text-sm opacity-80">
            Saldo disponível
            <button
              onClick={() => setHidden(!hidden)}
              aria-label="Alternar visibilidade"
            >
              {hidden ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-5 text-3xl font-semibold">{display(balance)}</p>
          <p className="mt-5 text-xs opacity-80">
            <TrendingUp className="mr-1 inline size-3" />
            12,8% vs. mês anterior
          </p>
        </div>
        <Stat
          title="Receitas"
          value={income}
          icon={ArrowDownLeft}
          color="text-chart-2"
        />
        <Stat
          title="Despesas"
          value={expenses}
          icon={ArrowUpRight}
          color="text-chart-4"
        />
      </div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Chart transactions={transactions} />
        <Categories transactions={transactions} expenses={expenses} />
      </div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Transactions
          transactions={transactions.slice(0, 5)}
          allTransactions={allTransactions}
          setTransactions={setTransactions}
          onDelete={onDeleteTransaction}
        />
        <Goals
          goals={goals}
          setGoalModal={setGoalModal}
          onUpdate={updateGoal}
          onDelete={deleteGoal}
          onAddContribution={onAddContribution}
        />
      </div>
    </div>
  );
}
function Stat({ title, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex justify-between text-sm text-muted-foreground">
        {title}
        <Icon className={`size-5 ${color}`} />
      </div>
      <p className="mt-5 text-2xl font-semibold">{money(value)}</p>
      <p className={`mt-2 text-xs ${color}`}>
        +8,4% <span className="text-muted-foreground">este mês</span>
      </p>
    </div>
  );
}
function Chart({ transactions }: { transactions: Transaction[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const points = Object.values(
    transactions.reduce<
      Record<string, { date: string; income: number; expense: number }>
    >((result, transaction) => {
      const point = result[transaction.date] ?? {
        date: transaction.date,
        income: 0,
        expense: 0,
      };
      point[transaction.type] += transaction.value;
      result[transaction.date] = point;
      return result;
    }, {}),
  ).slice(-7);
  const selectedTransactions = selectedDate
    ? transactions.filter((transaction) => transaction.date === selectedDate)
    : [];
  const selectedIncome = selectedTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.value, 0);
  const selectedExpense = selectedTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.value, 0);
  const max = Math.max(
    1,
    ...points.map((point) => Math.max(point.income, point.expense)),
  );
  const chartHeight = 176;
  return (
    <>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6">
        <h3 className="font-semibold">Evolução do caixa</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Clique em uma data para ver os lançamentos
        </p>
        <div className="relative mt-8 h-48 border-b border-border">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border/60" />
          {points.length ? (
            <div className="relative flex h-full min-w-0 items-end gap-2 px-1 md:gap-4">
              {points.map((point) => (
                <button
                  type="button"
                  key={point.date}
                  onClick={() => setSelectedDate(point.date)}
                  aria-label={`Ver lançamentos de ${point.date}`}
                  className="flex h-full min-w-0 flex-1 items-end justify-center gap-1 rounded-t-md px-1 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <i
                    title={`Receitas: ${money(point.income)}`}
                    className="w-1/2 rounded-t-sm bg-primary transition-[height]"
                    style={{
                      height: `${Math.max(point.income ? 5 : 0, (point.income / max) * chartHeight)}px`,
                    }}
                  />
                  <i
                    title={`Despesas: ${money(point.expense)}`}
                    className="w-1/2 rounded-t-sm bg-chart-4 transition-[height]"
                    style={{
                      height: `${Math.max(point.expense ? 5 : 0, (point.expense / max) * chartHeight)}px`,
                    }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              Adicione transações para visualizar a evolução.
            </p>
          )}
        </div>
        <div className="mt-3 flex justify-between gap-2 text-[10px] text-muted-foreground">
          {points.map((point) => (
            <span key={point.date} className="truncate">
              {point.date}
            </span>
          ))}
        </div>
        <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
          <span className="text-primary">● Receitas</span>
          <span className="text-chart-4">● Despesas</span>
        </div>
      </div>
      {selectedDate && (
        <Modal
          title={`Lançamentos de ${selectedDate}`}
          subtitle="Resumo dos valores registrados nesta data."
          onClose={() => setSelectedDate(null)}
        >
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-primary/10 p-3">
              <span className="block text-muted-foreground">Receitas</span>
              <b className="mt-1 block text-primary">{money(selectedIncome)}</b>
            </div>
            <div className="rounded-lg bg-chart-4/10 p-3">
              <span className="block text-muted-foreground">Despesas</span>
              <b className="mt-1 block text-chart-4">
                {money(selectedExpense)}
              </b>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <span className="block text-muted-foreground">Saldo</span>
              <b className="mt-1 block">
                {money(selectedIncome - selectedExpense)}
              </b>
            </div>
          </div>
          <div className="mt-5 max-h-64 overflow-y-auto divide-y divide-border">
            {selectedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {transaction.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category}
                  </p>
                </div>
                <b
                  className={
                    transaction.type === "income"
                      ? "text-chart-2"
                      : "text-chart-4"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {money(transaction.value)}
                </b>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
function Categories({
  transactions,
  expenses,
}: {
  transactions: Transaction[];
  expenses: number;
}) {
  const totals = transactions
    .filter((t) => t.type === "expense")
    .reduce<
      Record<string, number>
    >((result, transaction) => ({ ...result, [transaction.category]: (result[transaction.category] ?? 0) + transaction.value }), {});
  const items = Object.entries(totals)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 4);
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6">
      <h3 className="font-semibold">Gastos por categoria</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Distribuição deste mês
      </p>
      <div className="mt-7 flex min-w-0 flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div
          className="grid size-28 shrink-0 place-items-center rounded-full md:size-36"
          style={{
            background:
              "conic-gradient(hsl(var(--primary)) 0 59%, hsl(var(--chart-2)) 59% 83%, hsl(var(--chart-3)) 83% 93%, hsl(var(--chart-4)) 93% 100%)",
          }}
        >
          <div className="grid size-20 place-items-center rounded-full bg-card text-center md:size-24">
            <b className="text-sm md:text-base">{money(expenses)}</b>
            <small className="text-[10px] text-muted-foreground">
              total gasto
            </small>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 text-xs">
          {items.length ? (
            items.map(([name, value], index) => (
              <div className="flex min-w-0 items-center gap-2" key={name}>
                <i
                  className={`size-2 shrink-0 rounded-full ${["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4"][index]}`}
                />
                <span className="min-w-0 flex-1 break-words text-muted-foreground">
                  {name}
                </span>
                <b className="shrink-0">{money(value)}</b>
              </div>
            ))
          ) : (
            <span className="text-muted-foreground">
              Nenhum gasto cadastrado.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
function Transactions({
  transactions,
  allTransactions = transactions,
  setTransactions,
  onAdd,
  onDelete,
}: {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  setTransactions: (v: Transaction[]) => void;
  onAdd?: () => void;
  onDelete?: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const categories = [
    ...new Set(allTransactions.map((transaction) => transaction.category)),
  ];
  const visible = allTransactions.filter(
    (transaction) =>
      transaction.name.toLowerCase().includes(search.toLowerCase()) &&
      (type === "all" || transaction.type === type) &&
      (category === "all" || transaction.category === category),
  );
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Transações</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Seus lançamentos recentes
          </p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <Plus className="size-4" />
            Adicionar
          </button>
        )}
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar transação"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="mt-5 flex flex-col divide-y divide-border">
        {visible.length ? (
          visible.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3.5">
              <div
                className={`grid size-10 place-items-center rounded-xl ${t.type === "income" ? "bg-chart-2/15 text-chart-2" : "bg-muted text-muted-foreground"}`}
              >
                {t.type === "income" ? (
                  <ArrowDownLeft className="size-[18px]" />
                ) : (
                  <Wallet className="size-[18px]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} · {t.date}
                </p>
              </div>
              <b className={t.type === "income" ? "text-chart-2" : ""}>
                {t.type === "income" ? "+" : "−"}
                {money(t.value)}
              </b>
              <button
                onClick={() => onDelete?.(t.id)}
                aria-label={`Excluir ${t.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma transação encontrada.
          </p>
        )}
      </div>
    </div>
  );
}
function Goals({
  goals,
  setGoalModal,
  onUpdate,
  onDelete,
  onAddContribution,
}: {
  goals: Goal[];
  setGoalModal: (v: boolean) => void;
  onUpdate: (id: number, patch: Partial<Goal>) => void;
  onDelete: (id: number) => void;
  onAddContribution: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold">Metas de economia</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe e atualize seus objetivos
          </p>
        </div>
        <Target className="size-5 text-primary" />
      </div>
      <div className="mt-6 flex flex-col gap-5">
        {goals.map((g) => (
          <div key={g.id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{g.name}</span>
              <div className="flex items-center gap-2">
                <b>
                  {g.target > 0 ? Math.round((g.current / g.target) * 100) : 0}%
                </b>
                <button
                  onClick={() => onAddContribution(g.id)}
                  className="text-primary"
                >
                  Adicionar aporte
                </button>
                <button
                  onClick={() => onDelete(g.id)}
                  aria-label={`Excluir meta ${g.name}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {money(g.current)} de {money(g.target)}
              </span>
              <input
                aria-label={`Valor guardado em ${g.name}`}
                value={g.current}
                onChange={(e) =>
                  onUpdate(g.id, {
                    current: Math.max(0, Number(e.target.value)),
                  })
                }
                type="number"
                min="0"
                className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-foreground"
              />
            </div>
            {g.contributions?.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Último aporte: {money(g.contributions[0].value)} em{" "}
                {new Date(g.contributions[0].createdAt).toLocaleDateString(
                  "pt-BR",
                )}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <button
        onClick={() => setGoalModal(true)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm"
      >
        <Plus className="size-4" />
        Criar nova meta
      </button>
    </div>
  );
}
function Accounts({
  accounts,
  onEdit,
  onAdd,
  onDelete,
}: {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-6 px-5 py-7 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Contas e cartões</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edite seus saldos e cartões a qualquer momento.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" />
          Adicionar
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                {a.type.includes("Cartão") ? <CreditCard /> : <Wallet />}
              </div>
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.type}</p>
              </div>
              <button
                onClick={() => onEdit(a)}
                aria-label={`Editar ${a.name}`}
                className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => onDelete(a.id)}
                aria-label={`Excluir ${a.name}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-7 text-2xl font-semibold">{money(a.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
function AccountModal({ form, setForm, editing, onClose, onSave }: any) {
  return (
    <Modal
      title={editing ? "Editar conta ou cartão" : "Adicionar conta ou cartão"}
      subtitle="Atualize os dados para acompanhar seu saldo."
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-border bg-background px-3 py-3"
          placeholder="Nome da conta ou cartão"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded-xl border border-border bg-background px-3 py-3"
        >
          <option>Conta corrente</option>
          <option>Conta poupança</option>
          <option>Cartão de crédito</option>
          <option>Fatura atual</option>
        </select>
        <input
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          type="number"
          min="0"
          step="0.01"
          className="rounded-xl border border-border bg-background px-3 py-3"
          placeholder="Saldo ou valor da fatura"
        />
        <button
          onClick={onSave}
          className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
        >
          {editing ? "Salvar alterações" : "Adicionar"}
        </button>
      </div>
    </Modal>
  );
}
function SettingsPanel({
  user,
  usage,
}: {
  user: User;
  usage: { transactions: number; goals: number; accounts: number };
}) {
  const premium = user.plan === "premium";
  const upgrade = async () => {
    const response = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await response.json();
    if (response.ok && data.url) window.location.href = data.url;
    else window.alert(data.error ?? "Não foi possível iniciar o upgrade.");
  };
  return (
    <div className="space-y-6 px-5 py-7 md:px-10">
      <div>
        <h2 className="text-2xl font-semibold">Meu plano</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe seus limites e recursos disponíveis.
        </p>
      </div>
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        <div
          className={`rounded-2xl border p-6 ${!premium ? "border-primary bg-primary/10" : "border-border bg-card"}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Basic</h3>
            {!premium && (
              <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                Atual
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Para começar a organizar suas finanças.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>Até 50 transações</li>
            <li>Até 3 metas</li>
            <li>Até 2 contas ou cartões</li>
            <li>Dashboard financeiro</li>
          </ul>
        </div>
        <div
          className={`rounded-2xl border p-6 ${premium ? "border-primary bg-primary/10" : "border-border bg-card"}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Premium</h3>
            {premium && (
              <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                Atual
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Para acompanhar tudo sem limites.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>Transações ilimitadas</li>
            <li>Metas ilimitadas</li>
            <li>Contas e cartões ilimitados</li>
            <li>Recursos avançados</li>
          </ul>
          {!premium && (
            <button
              onClick={upgrade}
              className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Fazer upgrade
            </button>
          )}
        </div>
      </div>
      <div className="max-w-4xl rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold">Uso atual</h3>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <p>
            <span className="text-muted-foreground">Transações</span>
            <br />
            <b>{usage.transactions}</b> / {premium ? "ilimitadas" : "50"}
          </p>
          <p>
            <span className="text-muted-foreground">Metas</span>
            <br />
            <b>{usage.goals}</b> / {premium ? "ilimitadas" : "3"}
          </p>
          <p>
            <span className="text-muted-foreground">Contas</span>
            <br />
            <b>{usage.accounts}</b> / {premium ? "ilimitadas" : "2"}
          </p>
        </div>
      </div>
    </div>
  );
}
function TransactionModal({
  form,
  setForm,
  continueAdding,
  setContinueAdding,
  onClose,
  onSave,
}: any) {
  return (
    <Modal
      title="Nova transação"
      subtitle="Registre um novo lançamento."
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setForm({ ...form, type: "expense" })}
            className={`flex-1 rounded-xl border py-2 text-sm ${form.type === "expense" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
          >
            Despesa
          </button>
          <button
            onClick={() =>
              setForm({ ...form, type: "income", category: "Salário" })
            }
            className={`flex-1 rounded-xl border py-2 text-sm ${form.type === "income" ? "border-chart-2 bg-chart-2/10 text-chart-2" : "border-border"}`}
          >
            Receita
          </button>
        </div>
        <input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-border bg-background px-3 py-3"
          placeholder="Descrição"
        />
        <input
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          type="number"
          min="0"
          className="rounded-xl border border-border bg-background px-3 py-3"
          placeholder="Valor (R$)"
        />
        <select
          aria-label="Categoria da transação"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded-xl border border-border bg-background px-3 py-3"
        >
          {(form.type === "income"
            ? ["Salário", "Renda extra"]
            : categories.filter((c) => c !== "Salário" && c !== "Renda extra")
          ).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={continueAdding}
            onChange={(e) => setContinueAdding(e.target.checked)}
            className="size-4 accent-primary"
          />
          Continuar adicionando lançamentos
        </label>
        <button
          onClick={onSave}
          className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
        >
          Adicionar transação
        </button>
      </div>
    </Modal>
  );
}
function GoalModal({ form, setForm, onClose, onSave }: any) {
  return (
    <Modal
      title="Nova meta"
      subtitle="Defina um objetivo para acompanhar."
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-border bg-background px-3 py-3"
          placeholder="Nome da meta"
        />
        <input
          value={form.target}
          onChange={(e) => setForm({ ...form, target: e.target.value })}
          type="number"
          min="1"
          className="rounded-xl border border-border bg-background px-3 py-3"
          placeholder="Valor alvo (R$)"
        />
        <button
          onClick={onSave}
          className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
        >
          Criar meta
        </button>
      </div>
    </Modal>
  );
}
function Modal({ title, subtitle, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-5 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
