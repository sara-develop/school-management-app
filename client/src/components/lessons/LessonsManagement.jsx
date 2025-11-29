import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import AddLesson from "./AddLesson";
import UpdateLesson from "./UpdateLesson";

const LessonsManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [activeComponent, setActiveComponent] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const token = useSelector((state) => state.user.token);
  const toast = useRef(null);

  const fetchLessons = async () => {
    try {
      const { data } = await axios.get(`http://localhost:1235/api/lesson/getAllLessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedLessons = data.sort((a, b) => a.name.localeCompare(b.name));
      setLessons(sortedLessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this lesson?",
      header: "Delete Confirmation",
      acceptClassName: "p-button-success", // Green
      rejectClassName: "p-button-danger", // Red
      acceptLabel: "Yes",
      rejectLabel: "No",
      accept: async () => {
        try {
          await axios.delete(`http://localhost:1235/api/lesson/deleteLesson/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchLessons();
          toast.current.show({
            severity: "error", // אדום
            summary: "Deleted",
            detail: "Lesson deleted successfully",
            life: 3000,
          });
        }
        catch (error) {
          const message = error.response?.data?.message;

          if (error.response?.status === 409) {
            toast.current.show({
              severity: "warn",
              summary: "Cannot Delete",
              detail: "This lesson is used in the schedule and cannot be deleted.",
              life: 3000,
            });
          } else {
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "An error occurred while deleting the lesson.",
              life: 3000,
            });
          }

          console.error("Error deleting lesson:", error);
        }
      },
    });
  };

  useEffect(() => {
    fetchLessons();
  }, [token]);

  const buttonStyle = {
    backgroundColor: "#542468",
    borderColor: "#542468",
    color: "#FFFFFF",
  };

  if (activeComponent === "add") {
    return (
      <AddLesson
        fetchLessons={fetchLessons}
        setActiveComponent={setActiveComponent}
      />
    );
  }

  if (activeComponent === "update") {
    return (
      <UpdateLesson
        lesson={selectedLesson}
        fetchLessons={fetchLessons}
        setActiveComponent={setActiveComponent}
      />
    );
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />

      <DataTable value={lessons} tableStyle={{ minWidth: "60rem" }}>
        <Column field="name" header="Lesson Name" />
        <Column field="teacher" header="Teacher" />
        <Column
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                style={buttonStyle}
                onClick={() => {
                  setSelectedLesson(rowData);
                  setActiveComponent("update");
                }}
              />
              <Button
                icon="pi pi-trash"
                style={buttonStyle}
                onClick={() => handleDelete(rowData._id)}
              />
            </div>
          )}
        />
      </DataTable>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <Button
          icon="pi pi-plus"
          label="Add Lesson"
          style={buttonStyle}
          onClick={() => setActiveComponent("add")}
        />
      </div>
    </div>
  );
};

export default LessonsManagement;