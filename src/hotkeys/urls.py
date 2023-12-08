from django.contrib import admin
from django.urls import path
from hotkeys.views import HKPView, GenerateHKPView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('upload/', HKPView.as_view()),
    path('generate/', GenerateHKPView.as_view())
]
