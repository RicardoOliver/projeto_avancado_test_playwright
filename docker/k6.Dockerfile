FROM grafana/k6:latest

WORKDIR /scripts

# Copiar scripts k6
COPY ./k6 .

# Comando padrão
ENTRYPOINT ["k6", "run"]
CMD ["load-test.js"]
