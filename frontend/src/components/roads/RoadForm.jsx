import { useEffect, useState } from "react";

function RoadForm({

  open,

  onClose,

  onSave,

  editingRoad,

}) {

  const [form, setForm] = useState({

    name: "",

    city: "",

    state: "",

    status: "Normal",

    speed_limit: 60,

  });

  useEffect(() => {

    if (editingRoad) {

      setForm(editingRoad);

    } else {

      setForm({

        name: "",

        city: "",

        state: "",

        status: "Normal",

        speed_limit: 60,

      });

    }

  }, [editingRoad]);

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
        zIndex: 999,
      }}
    >

      <div
        style={{
          background: "#fff",
          width: "500px",
          borderRadius: "12px",
          padding: "25px",
        }}
      >

        <h2>

          {

            editingRoad

              ? "Edit Road"

              : "Add Road"

          }

        </h2>

        <br />

        <input

          placeholder="Road Name"

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

          <option>Normal</option>

          <option>Moderate</option>

          <option>Heavy</option>

        </select>

        <br /><br />

        <input

          type="number"

          placeholder="Speed Limit"

          value={form.speed_limit}

          onChange={(e) =>

            setForm({

              ...form,

              speed_limit: Number(e.target.value),

            })

          }

        />

        <br /><br />

        <div
          style={{
            display: "flex",
            gap: "15px",
          }}
        >

          <button

            onClick={() => onSave(form)}

          >

            Save

          </button>

          <button

            onClick={onClose}

          >

            Cancel

          </button>

        </div>

      </div>

    </div>

  );

}

export default RoadForm;