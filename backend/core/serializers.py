from rest_framework import serializers
from .models import User,Project,Task,Comment,ActivityLog,TaskAssignmentHistory,Tag,Flag,SubTask

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) 

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self,validated_data):
        user = User.objects.create_user(**validated_data)   
        return user 
    

class ProjectSerializer(serializers.ModelSerializer):
    assigned_users = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(),
        many=True
    )
    task_count = serializers.SerializerMethodField()
    assigned_users_count = serializers.SerializerMethodField()
    class Meta:
        model=Project
        fields = '__all__'
        read_only_fields = ['created_by','created_at']

    def get_task_count(self, obj):
        return obj.tasks.count()  

    def get_assigned_users_count(self,obj):
        return obj.assigned_users.count()  
    
    def update(self,instance,validated_data):
        assigned_users = validated_data.pop('assigned_users',None)

        project =super().update(instance,validated_data)

        if assigned_users is not None:
            project.assigned_users.set(assigned_users)

        return project   
    

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class FlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flag
        fields = "__all__"    

class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name",read_only=True)
    assigned_user_username = serializers.CharField(source="assigned_user.username",read_only=True)
    assigned_user_first_name = serializers.CharField(source="assigned_user.first_name",read_only=True)
    assigned_by_username = serializers.CharField(source="assigned_by.username", read_only=True)
    output = serializers.ImageField(required=False)
    tags = TagSerializer(many=True, read_only=True)
    flags = FlagSerializer(many=True, read_only=True)

    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, source="tags", required=False
    )
    flag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Flag.objects.all(), many=True, write_only=True, source="flags", required=False
    )

    class Meta:
        model = Task
        fields = '__all__'    

    
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username','email','role','is_active','password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user  
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_is_admin(self, obj):
        return obj.author.role == "admin"  

    

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    project_name = serializers.CharField(source="task.project.name", read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"



class TaskAssignmentHistorySerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)
    assigned_by_username = serializers.CharField(source="assigned_by.username", read_only=True)

    class Meta:
        model = TaskAssignmentHistory
        fields = "__all__"        


class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = "__all__"        

