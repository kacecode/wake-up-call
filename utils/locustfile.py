from locust import HttpLocust, TaskSet, task

class UserBehavior(TaskSet):

    @task(1)
    def do_the_thing(l):
        l.client.post("/", '{"host": "127.0.0.1", "path": "/", "port": 8000, "delay": 5000, "method": "GET"}')

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000
