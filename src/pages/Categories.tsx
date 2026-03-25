import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useCategories, Category } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Trash2, Edit2, Check, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ErrorBoundary from "@/components/ErrorBoundary";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#64748b", "#a855f7",
];

const PRESET_ICONS = ["📁", "🏢", "💼", "🎨", "🛒", "📱", "💡", "🎯", "📊", "🏠", "✈️", "🎓", "⚡", "🔧", "❤️", "🌟"];

const Categories = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategories(workerId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);

  if (!workerId) return <Navigate to="/" replace />;

  const handleAdd = () => {
    if (!name.trim()) return;
    addCategory.mutate({ name: name.trim(), color, icon });
    setName("");
    setColor(PRESET_COLORS[0]);
    setIcon(PRESET_ICONS[0]);
    setIsAdding(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
  };

  const handleUpdate = () => {
    if (!editingId || !name.trim()) return;
    updateCategory.mutate({ id: editingId, name: name.trim(), color, icon });
    setEditingId(null);
    setName("");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setIcon(PRESET_ICONS[0]);
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-subtle"
        dir="rtl"
      >
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/member/${workerId}`)}
              className="flex items-center gap-2 hover:bg-accent"
              size={isMobile ? "sm" : "default"}
            >
              <ArrowRight className="h-4 w-4" />
              חזרה למשימות
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full h-9 w-9 hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">קטגוריות</h1>
            <p className="text-muted-foreground text-sm">צור קטגוריות מותאמות אישית לארגון המשימות שלך</p>
          </div>

          {/* Categories list */}
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  {editingId === cat.id ? (
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1 text-right h-10 border-2 border-border/50 focus:border-primary/50 rounded-lg bg-background/50"
                          style={{ textAlign: "right", direction: "rtl" }}
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={cn(
                              "w-7 h-7 rounded-full transition-all duration-200 border-2",
                              color === c ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_ICONS.map((i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setIcon(i)}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2",
                              icon === i ? "border-primary bg-primary/10 scale-110" : "border-transparent hover:bg-muted"
                            )}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate} className="rounded-lg gap-1">
                          <Check className="h-4 w-4" />
                          שמור
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="rounded-lg gap-1">
                          <X className="h-4 w-4" />
                          בטל
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0"
                          style={{ backgroundColor: cat.color + "20", borderColor: cat.color, borderWidth: 2 }}
                        >
                          {cat.icon}
                        </div>
                        <span className="font-medium text-foreground truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-accent"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl" className="rounded-2xl max-w-md">
                            <AlertDialogHeader className="text-right">
                              <AlertDialogTitle>מחיקת קטגוריה</AlertDialogTitle>
                              <AlertDialogDescription>
                                האם למחוק את "{cat.name}"? משימות עם קטגוריה זו לא יימחקו.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row gap-2">
                              <AlertDialogCancel className="flex-1 rounded-xl">ביטול</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCategory.mutate(cat.id)}
                                className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl"
                              >
                                מחק
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && categories.length === 0 && !isAdding && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">אין קטגוריות עדיין</p>
                <p className="text-sm">צור את הקטגוריה הראשונה שלך למטה</p>
              </div>
            )}
          </div>

          {/* Add form */}
          <AnimatePresence>
            {isAdding ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="שם הקטגוריה..."
                    className="flex-1 text-right h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl bg-background/50"
                    style={{ textAlign: "right", direction: "rtl" }}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">צבע</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all duration-200 border-2",
                          color === c ? "border-foreground scale-110 shadow-lg" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">אייקון</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2",
                          icon === i ? "border-primary bg-primary/10 scale-110" : "border-transparent hover:bg-muted"
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {name.trim() && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">תצוגה מקדימה:</p>
                    <span
                      className="text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                      style={{ backgroundColor: color + "20", color }}
                    >
                      <span>{icon}</span>
                      <span>{name}</span>
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button onClick={handleAdd} disabled={!name.trim()} className="flex-1 rounded-xl h-11 gap-1">
                    <Check className="h-4 w-4" />
                    צור קטגוריה
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1 rounded-xl h-11 gap-1">
                    <X className="h-4 w-4" />
                    בטל
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  onClick={() => setIsAdding(true)}
                  className={cn(
                    "w-full rounded-2xl h-12 text-lg font-medium gap-2",
                    "bg-gradient-to-r from-primary/10 via-accent/50 to-primary/10",
                    "hover:from-primary/20 hover:via-accent hover:to-primary/20",
                    "text-primary border-2 border-dashed border-primary/30 hover:border-primary/60",
                    "transition-all duration-300"
                  )}
                  variant="ghost"
                >
                  <Plus className="h-5 w-5" />
                  הוסף קטגוריה חדשה
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default Categories;
