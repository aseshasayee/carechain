"""
Celery config for carechain project.
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'carechain.settings')

# Create the Celery app
app = Celery('carechain')

# Use the Django settings module as a configuration source
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Define the beat schedule
app.conf.beat_schedule = {
    'reset-monthly-quotas': {
        'task': 'jobs.tasks.reset_monthly_quotas',
        'schedule': crontab(0, 0, day_of_month='1'),  # Run at midnight on the first day of each month
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 