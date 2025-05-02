AIRFLOW_VERSION	= 2.8.1
PYTHON_VERSION	= 3.10
VENV_DIR				= .venv
CONSTRAINT_URL	= https://raw.githubusercontent.com/apache/airflow/constraints-$(AIRFLOW_VERSION)/constraints-$(PYTHON_VERSION).txt

include .env
export $(shell sed 's/=.*//' .env)

venv:
	python3 -m venv $(VENV_DIR)
	@echo "Virtual environment created at $(VENV_DIR)"

install: venv
	. $(VENV_DIR)/bin/activate && \
	uv pip install --constraint "$(CONSTRAINT_URL)" -r requirements.txt

init-db:
	$(VENV_DIR)/bin/airflow db init

create-user:
	$(VENV_DIR)/bin/airflow users create \
		--username admin \
		--firstname Admin \
		--lastname User \
		--role Admin \
		--email admin@example.com \
		--password admin

webserver:
	AIRFLOW_HOME=$(AIRFLOW_HOME) \
	AIRFLOW__CORE__DAGS_FOLDER=$(AIRFLOW_DAGS_FOLDER) \
	AIRFLOW__CORE__PLUGINS_FOLDER=$(AIRFLOW_PLUGINS_FOLDER) \
	AIRFLOW__LOGGING__BASE_LOG_FOLDER=$(AIRFLOW_LOGS_FOLDER) \
	$(VENV_DIR)/bin/airflow webserver

scheduler:
	AIRFLOW_HOME=$(AIRFLOW_HOME) \
	AIRFLOW__CORE__DAGS_FOLDER=$(AIRFLOW_DAGS_FOLDER) \
	AIRFLOW__CORE__PLUGINS_FOLDER=$(AIRFLOW_PLUGINS_FOLDER) \
	AIRFLOW__LOGGING__BASE_LOG_FOLDER=$(AIRFLOW_LOGS_FOLDER) \
	$(VENV_DIR)/bin/airflow scheduler

reset-db:
	$(VENV_DIR)/bin/airflow db reset -y

start: install init-db create-user
	@echo "Airflow ready for start"

test-dag:
	AIRFLOW_HOME=$(AIRFLOW_HOME) \
	AIRFLOW__CORE__DAGS_FOLDER=$(AIRFLOW_DAGS_FOLDER) \
	$(VENV_DIR)/bin/airflow dags list
