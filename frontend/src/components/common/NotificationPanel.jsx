import {
  deleteNotification,
  markNotificationRead,
} from "../../services/notifications";

function NotificationPanel({

  notifications,

  refresh,

}) {

  return (

    <div
      style={{
        position: "absolute",
        top: "70px",
        right: "20px",
        width: "380px",
        maxHeight: "500px",
        overflowY: "auto",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 5px 20px rgba(0,0,0,.2)",
        padding: "15px",
        zIndex: 999,
      }}
    >

      <h3>Notifications</h3>

      <hr />

      {

        notifications.length === 0

          ? <p>No Notifications</p>

          : notifications.map(notification => (

            <div
                key={notification.id}
                style={{
                    padding: "12px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    border: notification.is_read
                        ? "1px solid #e5e7eb"
                        : "2px solid #2563eb",
                    background: notification.is_read
                        ? "#ffffff"
                        : "#eff6ff",
                }}
            >

              <strong
                  style={{
                      fontWeight: notification.is_read ? 600 : 800,
                      fontSize: "15px",
                  }}
              >
                  {notification.title}
              </strong>

              {!notification.is_read && (
                  <span
                      style={{
                          marginLeft: "8px",
                          padding: "2px 8px",
                          background: "#2563eb",
                          color: "#fff",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "bold",
                      }}
                  >
                      NEW
                  </span>
              )}
              
              <p
                  style={{
                      marginTop: "6px",
                      marginBottom: "10px",
                      fontWeight: notification.is_read ? 400 : 600,
                  }}
              >
                  {notification.message}
              </p>

              <small>

                {notification.type}

              </small>

              <br /><br />

              {

                !notification.is_read && (

                  <button

                    onClick={async () => {

                      await markNotificationRead(notification.id);

                      refresh();

                    }}

                  >

                    Mark Read

                  </button>

                )

              }

              <button

                style={{
                  marginLeft: "10px",
                }}

                onClick={async () => {

                  await deleteNotification(notification.id);

                  refresh();

                }}

              >

                Delete

              </button>

            </div>

          ))

      }

    </div>

  );

}

export default NotificationPanel;