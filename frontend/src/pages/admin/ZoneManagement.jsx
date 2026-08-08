import { useEffect, useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";

import ZoneCard from "../../components/zones/ZoneCard";
import ZoneForm from "../../components/zones/ZoneForm";

import {

  getZones,

  createZone,

  updateZone,

  deleteZone,

} from "../../services/zones";

function ZoneManagement() {

  const [zones, setZones] = useState([]);

  const [open, setOpen] = useState(false);

  const [editingZone, setEditingZone] = useState(null);

  const loadZones = async () => {

    const data = await getZones();

    setZones(data);

  };

  useEffect(() => {

    loadZones();

  }, []);

  const handleSave = async (zone) => {

    if (editingZone) {

      await updateZone(editingZone.id, zone);

    }

    else {

      await createZone(zone);

    }

    setOpen(false);

    setEditingZone(null);

    await loadZones();

  };

  const handleDelete = async (id) => {

    await deleteZone(id);

    await loadZones();

  };

  return (

    <AdminLayout

      title="Zone Management"

      subtitle="Manage all traffic zones"

    >

      <button

        onClick={() => {

          setEditingZone(null);

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

        + Add Zone

      </button>

      <br /><br />

      {

        zones.map(zone => (

          <ZoneCard

            key={zone.id}

            zone={zone}

            onEdit={(z) => {

              setEditingZone(z);

              setOpen(true);

            }}

            onDelete={handleDelete}

          />

        ))

      }

      <ZoneForm

        open={open}

        editingZone={editingZone}

        onClose={() => {

          setOpen(false);

          setEditingZone(null);

        }}

        onSave={handleSave}

      />

    </AdminLayout>

  );

}

export default ZoneManagement;