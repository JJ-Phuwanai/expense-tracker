"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
}
interface UserContextType {
  currentUserId: string;
  userName: string;
  users: User[];
  switchUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        const userList = data.users || [];
        setUsers(userList);

        const savedId = localStorage.getItem("selected_person_id");
        if (savedId) {
          const user = userList.find((u: User) => u.id === savedId);
          if (user) {
            setCurrentUserId(savedId);
            setUserName(user.name);
          } else {
            setShowEntryModal(true);
          }
        } else {
          setShowEntryModal(true);
        }
      });
  }, []);

  const switchUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setCurrentUserId(id);
      setUserName(user.name);
      localStorage.setItem("selected_person_id", id);
      setShowEntryModal(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ currentUserId, userName, users, switchUser }}
    >
      {children}

      {showEntryModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-card rounded-[3rem] p-8 shadow-2xl border border-border/40 text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-widest text-foreground">
                เลือกผู้ใช้งาน
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                กรุณาเลือกโปรไฟล์ของคุณเพื่อเข้าสู่ระบบ
              </p>
            </div>

            <div className="grid gap-3">
              {users.length > 0 ? (
                users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className="w-full py-5 rounded-[2rem] bg-muted/50 hover:bg-primary hover:text-white text-lg font-black transition-all active:scale-95 shadow-sm border border-border/10"
                  >
                    {u.name}
                  </button>
                ))
              ) : (
                <div className="py-4 animate-pulse text-muted-foreground font-bold italic">
                  กำลังโหลดรายชื่อ...
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground/50 font-medium italic">
              * ข้อมูลจะถูกบันทึกแยกตามโปรไฟล์ที่เลือก
            </p>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
