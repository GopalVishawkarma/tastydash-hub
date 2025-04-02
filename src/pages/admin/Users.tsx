
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Search, UserCheck, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Don't fetch the current admin
        const usersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(usersQuery);
        const fetchedUsers: User[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ 
            uid: doc.id, 
            ...doc.data() 
          } as User);
        });
        
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user => 
          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const toggleAdminStatus = async (userId: string, currentRole: "admin" | "customer") => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, role: newRole as "admin" | "customer" } 
            : user
        )
      );
      
      toast({
        title: "User Role Updated",
        description: `User is now ${newRole === "admin" ? "an admin" : "a customer"}.`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update user role. Please try again.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.uid}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{user.displayName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="mt-2 flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          Joined: {user.createdAt instanceof Timestamp
                            ? new Date(user.createdAt.toDate()).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    {user.email !== "admin@tastydash.com" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={user.role === "admin" ? "destructive" : "outline"}
                            size="sm"
                          >
                            {user.role === "admin" ? (
                              <>
                                <UserX className="mr-1 h-3 w-3" /> Remove Admin
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-1 h-3 w-3" /> Make Admin
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.role === "admin"
                                ? `This will remove admin privileges from ${user.displayName}.`
                                : `This will grant admin privileges to ${user.displayName}.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => toggleAdminStatus(user.uid, user.role)}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
