import { useEffect, useState } from "react";

function ZoneForm({

  open,

  editingZone,

  onClose,

  onSave,

}) {

  const [form, setForm] = useState({

    name: "",

    city: "",

    state: "",

    status: "Active",

    roads: 0,

  });

  useEffect(() => {

    if (editingZone) {

      setForm(editingZone);

    }

    else {

      setForm({

        name: "",

        city: "",

        state: "",

        status: "Active",

        roads: 0,

      });

    }

  }, [editingZone]);

  if (!open) return null;

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <div
        style={{
          width: "500px",
          background: "#fff",
          borderRadius: "12px",
          padding: "25px",
        }}
      >

        <h2>

          {

            editingZone

              ? "Edit Zone"

              : "Add Zone"

          }

        </h2>

        <br />

        <input
          placeholder="Zone Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            setForm({
              ...form,
              city: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="State"
          value={form.state}
          onChange={(e) =>
            setForm({
              ...form,
              state: e.target.value,
            })
          }
        />

        <br /><br />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
        >

          <option>Active</option>

          <option>Inactive</option>

        </select>

        <br /><br />

        <input
          type="number"
          placeholder="Road Count"
          value={form.roads}
          onChange={(e) =>
            setForm({
              ...form,
              roads: Number(e.target.value),
            })
          }
        />

        <br /><br />

        <button
          onClick={() => onSave(form)}
        >
          Save
        </button>

        <button
          onClick={onClose}
          style={{
            marginLeft: "10px",
          }}
        >
          Cancel
        </button>

      </div>

    </div>

  );

}

export default ZoneForm;