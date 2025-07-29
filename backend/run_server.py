#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('c:\\Users\\asesh\\OneDrive\\Desktop\\job portal\\backend')

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'carechain.settings'

# Setup Django
django.setup()

from django.core.management import execute_from_command_line

if __name__ == '__main__':
    execute_from_command_line(['manage.py', 'runserver'])
