import { useEffect, useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";
import RoadCard from "../../components/roads/RoadCard";
import RoadForm from "../../components/roads/RoadForm";

import {

  getRoads,

  createRoad,

  updateRoad,

  deleteRoad,

} from "../../services/roads";

function RoadManagement() {
  const [roads, setRoads] = useState([]);

  const [open, setOpen] = useState(false);

  const [editingRoad, setEditingRoad] = useState(null);

  const loadRoads = async () => {
    try {
      const data = await getRoads();
      setRoads(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRoads();
  }, []);

  const handleSave = async (road) => {

    if (editingRoad) {

      await updateRoad(

        editingRoad.id,

        road

      );

    }

    else {

      await createRoad(road);

    }

    setOpen(false);
    
    setEditingRoad(null);

    await loadRoads();

  };

  const handleEdit = (road) => {

    setEditingRoad(road);

    setOpen(true);

  };
  
  const handleDelete = async (id) => {
    await deleteRoad(id);
    loadRoads();
  };

  return (
    <AdminLayout
      title="Road Management"
      subtitle="Manage all roads"
    >
      <button
        onClick={() => {
          setEditingRoad(null);
          setOpen(true);
        }}
        style={{
          marginBottom: "20px",
          padding: "12px 18px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        + Add Road
      </button>

      {roads.map((road) => (
        <RoadCard
          key={road.id}
          road={road}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      <RoadForm

        open={open}

        editingRoad={editingRoad}

        onClose={() => {

          setOpen(false);

          setEditingRoad(null);

        }}

        onSave={handleSave}

      />
    </AdminLayout>
  );
}

export default RoadManagement;