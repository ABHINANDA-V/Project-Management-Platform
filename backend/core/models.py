from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('user','User'),
    )
    role = models.CharField(max_length=10,choices=ROLE_CHOICES, default='user')

# Project Model
class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True) 
    start_date = models.DateField(null=True,blank=True)
    created_by = models.ForeignKey(User,on_delete=models.CASCADE,related_name='created_projects')   
    assigned_users = models.ManyToManyField(User,related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)


class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Flag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

# Task Model
class Task(models.Model):
    STATUS_CHOICES = (
        ('todo','Todo'),
        ('in_progress','In Progress'),
        ('done','Done'),
    )

    PRIORITY_CHOICES = (
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
)
    REVIEW_CHOICES = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
    ('improve', 'Should Improve'),
)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='todo')

    project = models.ForeignKey(Project,on_delete=models.CASCADE,related_name='tasks')
    assigned_user = models.ForeignKey(User,on_delete=models.SET_NULL,null=True)

    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    story = models.TextField(blank=True,null=True)
    output = models.ImageField(upload_to='task_outputs/', null=True, blank=True)


    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    review_status = models.CharField(max_length=20, choices=REVIEW_CHOICES, default='pending')
    admin_comment = models.TextField(blank=True, null=True)

    tags = models.ManyToManyField(Tag, blank=True)
    flags = models.ManyToManyField(Flag, blank=True)


class SubTask(models.Model):
    STATUS_CHOICES = (
        ('todo', 'Todo'),
        ('done', 'Done'),
    )

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ActivityLog(models.Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE, related_name="activities")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    action = models.CharField(max_length=255)  
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action}"
    

class TaskAssignmentHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="assignment_history")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="assigned_to_history")
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="assigned_by_history")
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title} → {self.assigned_to}"    
    

