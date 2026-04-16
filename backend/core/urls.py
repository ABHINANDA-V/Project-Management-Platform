from django.urls import path,include
from .views import RegisterView,TestAuthView,UserViewSet,ProjectViewSet,TaskViewSet,AnalyticsView,CustomLoginView,CommentViewSet,ActivityLogListView,TaskAssignmentHistoryListView,TagViewSet,FlagViewSet,SubTaskViewSet
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('projects',ProjectViewSet)
router.register('tasks', TaskViewSet)
router.register('users', UserViewSet)
router.register('comments',CommentViewSet)
router.register('tags', TagViewSet)
router.register('flags', FlagViewSet)
router.register('subtasks', SubTaskViewSet)


urlpatterns = [
      # Auth routes
    path('auth/register/',RegisterView.as_view()),
    path('auth/login/',CustomLoginView.as_view()),
    path('auth/refresh/',TokenRefreshView.as_view()),

     # Test
    path('test/',TestAuthView.as_view()),

     # Analytics
    path('analytics/',AnalyticsView.as_view()),
    path("activity-logs/", ActivityLogListView.as_view()),

     # Project & Task routes
    path('',include(router.urls)),

    path("assignment-history/", TaskAssignmentHistoryListView.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)