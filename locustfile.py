from locust import HttpUser, task, between

# 🔑 TOKEN STATIS (HASIL LOGIN TESTING)
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInJvbGUiOiJudXJzZSIsImVtYWlsIjoibnVyc2VAbWVkcmVjLmxvY2FsIiwiaWF0IjoxNzY2OTkzMjI3LCJleHAiOjE3NjY5OTQxMjcsImF1ZCI6Im1lZHJlYy1jbGllbnQiLCJpc3MiOiJtZWRyZWMtYXBpIn0.O8bSL7YP6NJumo72DRcUTLlTeoc6O9NE8MEA0rG82wE"

class MedrecUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.client.headers.update({
            "Authorization": f"Bearer {TOKEN}"
        })

    @task
    def get_today_queues(self):
        self.client.get("/api/nurse/queues/today")
