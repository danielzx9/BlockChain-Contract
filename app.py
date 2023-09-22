from flask import Flask, render_template, url_for
import os

app = Flask(__name__)



@app.route('/')
def create_contract():
    return render_template('create_contract.html')

@app.route('/verificacion_contrato')
def check_contract():
    return render_template('check_clausula.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True,host='0.0.0.0', port=port)