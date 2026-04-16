from django.shortcuts import render
from rest_framework import generics
from .models import User,Project,Task,Comment,ActivityLog,TaskAssignmentHistory,Tag,Flag,SubTask
from .serializers import RegisterSerializer,ProjectSerializer,TaskSerializer,UserSerializer,CommentSerializer,ActivityLogSerializer,TaskAssignmentHistorySerializer,TagSerializer,FlagSerializer,SubTaskSerializer
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.utils.dateparse import parse_date
from django.db.models import Count
from django.db.models.functions import TruncDate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter


# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] 


class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        return Response({"message":"Authenticated Successfully"})
    

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated] 
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.all()

    # role-based filtering
        if user.role != 'admin':
            queryset = queryset

    #  DATE FILTER
        start_date = self.request.query_params.get('start_date')

        if start_date:
            queryset = queryset.filter(start_date=start_date)

        return queryset    


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_fields = ['status','assigned_user','project', 'priority']
    search_fields = ['title','project__name',
    'assigned_user__username']

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all()
        show_all = self.request.query_params.get("all")

        if show_all == "true":
        # Used for STATUS PAGE → show all tasks
            queryset = queryset
        else:
        # Default → only user's tasks
            queryset = queryset.filter(
            Q(assigned_user=user) |
            Q(project__assigned_users=user) |
            Q(assigned_by=user)
        ).distinct()


        due_date_from = self.request.query_params.get('due_date_from')
        due_date_to = self.request.query_params.get('due_date_to')

        if due_date_from:
            queryset = queryset.filter(due_date__gte=parse_date(due_date_from))

        if due_date_to:
            queryset = queryset.filter(due_date__lte=parse_date(due_date_to))

        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__id=tag)

        flag = self.request.query_params.get('flag')
        if flag:
            queryset = queryset.filter(flags__id=flag)   

        return queryset

    
    

    def perform_create(self, serializer):
        task = serializer.save(assigned_by=self.request.user)

        ActivityLog.objects.create(
            task=task,
            user=self.request.user,
            action="Created Task"
    )
        if task.assigned_user:
            TaskAssignmentHistory.objects.create(
            task=task,
            assigned_to=task.assigned_user,
            assigned_by=self.request.user
        )

    def perform_update(self, serializer):
        old_task = self.get_object()

        old_status = old_task.status
        old_user = old_task.assigned_user
        old_priority = old_task.priority

        task = serializer.save()

    # Status change
        if old_status != task.status:
            ActivityLog.objects.create(
                task=task,
                user=self.request.user,
                action="Changed Status",
                old_value=old_status,
                new_value=task.status
        )

    # Assigned user change
        if old_user != task.assigned_user:
            ActivityLog.objects.create(
                task=task,
                user=self.request.user,
                action="Changed Assignee",
                old_value=str(old_user),
                new_value=str(task.assigned_user)
        )
          
        TaskAssignmentHistory.objects.create(
        task=task,
        assigned_to=task.assigned_user,
        assigned_by=self.request.user
    )

    # Priority change
        if old_priority != task.priority:
            ActivityLog.objects.create(
            task=task,
            user=self.request.user,
            action="Changed Priority",
            old_value=old_priority,
            new_value=task.priority
        )
            
        # Review status change
        if old_task.review_status != task.review_status:
            ActivityLog.objects.create(
        task=task,
        user=self.request.user,
        action="Review Status Changed",
        old_value=old_task.review_status,
        new_value=task.review_status
    )    
    

class AnalyticsView(APIView):
    def get(self,request):

        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status ='done').count()
        active_users = User.objects.filter(task__isnull=False).distinct().count()
        tasks_per_day = (
            Task.objects.filter(status = 'done').annotate(date=TruncDate('created_at')).values('date').annotate(count=Count('id'))
        )

        # Project Completion %
        total_projects = Project.objects.count()
        completed_projects = Project.objects.filter(tasks__status='done').distinct().count()

        project_completion = 0
        if total_projects > 0:
            project_completion = (completed_projects / total_projects) * 100

        return Response({
            "total_tasks" : total_tasks,
            "completed_tasks":completed_tasks,
            "active_users":active_users,
            "tasks_completed_per_day":tasks_per_day,
            "project_completion_percentage":project_completion

        })    

class CustomLoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user   

        return Response({
            "access": serializer.validated_data['access'],
            "refresh": serializer.validated_data['refresh'],
            "role": user.role,
            "username":user.username,
            "id": user.id  
        })
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter]

    search_fields = ['username', 'email']
    filterset_fields = ['role', 'is_active']


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = Comment.objects.all().order_by("created_at")

        task_id = self.request.query_params.get('task')

        if task_id and str(task_id).isdigit():
            queryset = queryset.filter(task_id=task_id)

        return queryset

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("You can edit only your comment")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("You can delete only your comment")
        instance.delete()    

   
class ActivityPagination(PageNumberPagination):
    page_size = 10     

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    pagination_class = ActivityPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__username']

    def get_queryset(self):
        queryset = ActivityLog.objects.all().order_by("-created_at")
        task_id = self.request.query_params.get("task")
        date = self.request.query_params.get("date")
       
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        if date:
            queryset = queryset.filter(created_at__date=date)

        return queryset    
    

class TaskAssignmentHistoryListView(generics.ListAPIView):
    serializer_class = TaskAssignmentHistorySerializer

    def get_queryset(self):
        task_id = self.request.query_params.get("task")
        queryset = TaskAssignmentHistory.objects.all().order_by("-assigned_at")

        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset
    
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class FlagViewSet(viewsets.ModelViewSet):
    queryset = Flag.objects.all()
    serializer_class = FlagSerializer    



class SubTaskViewSet(viewsets.ModelViewSet):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = SubTask.objects.all()
        task_id = self.request.query_params.get("task")

        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset
