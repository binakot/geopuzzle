# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-02 14:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0010_country_is_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='country',
            name='is_global',
            field=models.BooleanField(default=False),
        ),
    ]