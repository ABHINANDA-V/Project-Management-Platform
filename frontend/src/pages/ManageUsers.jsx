import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import { getTasks } from "../services/taskService";
import { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiSearch,
  FiFilter,
} from "react-icons/fi";

const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;


  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users", search, roleFilter, statusFilter],
    queryFn: getUsers,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  // pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="p-8 bg-purple-50 min-h-screen">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-purple-900 flex items-center gap-2">
            <FiUsers className="text-purple-600" /> Manage Users
          </h1>
          <p className="text-purple-600 text-sm mt-1">
            Control access levels and monitor team workload.
          </p>
        </div>

        <button
          onClick={() => {
            setEditUser(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium text-sm"
        >
          <FiUserPlus /> Add New User
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
            className="w-full pl-10 pr-4 py-2 bg-purple-50 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <FiFilter className="text-purple-400" />
          <select
            className="bg-white border border-purple-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 text-gray-600"
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value);
               setCurrentPage(1);}
            }
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="bg-white border border-purple-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 text-gray-600"
            value={roleFilter}
            onChange={(e) => {setRoleFilter(e.target.value);
               setCurrentPage(1);}
            }
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-purple-700 uppercase bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-6 py-4 font-bold">User Information</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Task Load</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-50">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-400 italic"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const userTasks = tasks.filter(
                    (t) => t.assigned_user === user.id,
                  );

                  return (
                    <tr
                      key={user.id}
                      className="bg-white hover:bg-purple-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold border border-purple-200">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-purple-900">
                              {user.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">
                            {userTasks.length}
                          </span>
                          <span className="text-gray-400 text-xs">
                            Active Tasks
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <span
                            className={`font-medium text-sm ${user.is_active ? "text-green-700" : "text-red-600"}`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditUser(user);
                              setOpenModal(true);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                            title="Edit User"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${user.username}?`,
                                )
                              ) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete User"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center p-4 border-t border-purple-100 bg-white">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages || 1}
            </span>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {openModal && (
        <UserModal
          user={editUser}
          onClose={() => setOpenModal(false)}
          onSave={(data) => {
            if (editUser) {
              updateMutation.mutate(data);
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default ManageUsers;

const UserModal = ({ user, onClose, onSave }) => {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "user");

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { username, email, password, role };
    if (user) {
      onSave({ id: user.id, data });
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-purple-900/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-purple-100 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">
          {user ? "Update User Profile" : "Register New User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. johndoe"
              className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              Password{" "}
              {user && (
                <span className="text-xs font-normal text-gray-400">
                  (Leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!user}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              Access Level
            </label>
            <select
              className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Administrator</option>
              <option value="user">Standard User</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-lg transition-all"
            >
              {user ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
