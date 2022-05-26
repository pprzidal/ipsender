# ipsender

A simple nodejs script which sends the network infos (public IP of the network as well as network interface) of for example a single boad computer (like a Raspberry Pi) to its owner(s). A mediocre solution to avoid the usage of dynamic DNS.

## Usage

Just clone the repo and install the dependencies. Like so:

```bash
git clone https://github.com/pprzidal/ipsender.git
cd ipsender
npm ci
```

Create a file where the public IP is stored:

```bash
cd ipsender
curl https://api.myip.com > .ip.json
```

Provide a `.env` file. Rename the `example_config.env` to `.env` and change the values accordingly.

### Bonus

In most use cases it will be usefull to run this script as a daemon. Just copy the [ipSender.service](./ipSender.service) file into `/lib/systemd/system/`.

In order to make the system aware of this new Service you can run `sudo systemctl daemon-reload`. To enable this service to run on startup run `sudo systemctl enable --now ipSender`.