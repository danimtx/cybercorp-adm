import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig/Firebase";

import Loading from "../components/Loading";
import Login from "../login/Login";
import Home from "../pages/Home";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminTareas from "../pages/admin/AdminTareas";
import CreateUser from "../pages/admin/CreateUser";
import AdminInspecciones from "../pages/admin/AdminInspecciones";
import AdminCreateInspeccion from "../pages/admin/AdminCreateInspeccion";
import UserInspecciones from "../pages/UserInspecciones";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import TaskForm from "../pages/admin/TaskForm";
import AboutUs from "../pages/AboutUs";
import EditProfile from "../pages/EditProfile";

const auth = getAuth(appFirebase);

function Rutas() {
  const [usuario, setUsuario] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);

        try {
          const userDoc = doc(db, "users", usuarioFirebase.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            setRole(userSnap.data().role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error al obtener el rol:", error);
          setRole(null);
        }
      } else {
        setUsuario(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }
  console.log("Usuario en Rutas:", usuario);
console.log("UID en Rutas:", usuario?.uid);
  

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute isAllowed={!!usuario && role === "admin"} redirectPath="/home" />
          }
        >
          <Route element={<AdminLayout role={role} userId={usuario?.uid} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-tareas" element={<AdminTareas />} />
            <Route path="/admin-createUser" element={<CreateUser />} />
            <Route path="/admin-inspecciones" element={<AdminInspecciones />} />
            <Route path="/admin-createInspeccion" element={<AdminCreateInspeccion />} />
            <Route path="/admin-taskForm" element = {<TaskForm />} />
          </Route>
        </Route>

        {/* User Routes */}
        <Route element={<ProtectedRoute isAllowed={!!usuario} />}>
        <Route element={<UserLayout role={role} userId={usuario?.uid} />}>
          <Route path="/home" element={<Home role={role} name={usuario} />} />
          <Route path="/inspecciones" element={<UserInspecciones role={role} name={usuario} />} />
          <Route path="/nosotros" element={<AboutUs />} />
          <Route path="/editProfile" element={<EditProfile userId={usuario?.uid} />} />
        </Route> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default Rutas;
