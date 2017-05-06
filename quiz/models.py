from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.urls import reverse
from hvad.models import TranslatedFields

from maps.models import Game


QUIZ_OPTIONS = (
    ('name', 'name'),
    ('capital', 'capital'),
    ('flag', 'flag'),
    ('coat_of_arms', 'coat_of_arms')
)


class Quiz(Game):
    options = ArrayField(models.CharField(max_length=12, choices=QUIZ_OPTIONS),
                         default=['name', 'capital', 'flag', 'coat_of_arms'])
    translations = TranslatedFields(
        name=models.CharField(max_length=15)
    )

    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'

    def get_absolute_url(self) -> str:
        return reverse('quiz_map', args=(self.slug,))
